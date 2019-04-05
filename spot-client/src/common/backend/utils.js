import { logger } from 'common/logger';
import { getDeviceId } from 'common/utils/device-id';

/**
 * FIXME duplicated with post-to-endpoint and the jitter calculation in the loaders.
 *
 * Gets next timeout using the full jitter pattern.
 *
 * @param {number} retry - The retry number. It's 1 on the first retry.
 * @returns {number} - The amount of waiting before trying another time given in milliseconds.
 * @private
 */
function _getNextTimeout(retry) {
    // 1st retry 0 - 2 seconds
    // 2nd retry 0 - 4 seconds
    // 3rd retry 0 - 16 seconds
    return Math.floor(Math.random() * Math.pow(2, retry) * 1000);
}

/**
 * Sends HTTP request using {@code fetch} with retries on network and server errors.
 *
 * @param {Object} fetchOptions - Options related to the fetch request.
 * @param {string} fetchOptions.url - The URL to be passed to the fetch function.
 * @param {Object} fetchOptions.requestOptions - The options to be passed to the fetch function.
 * @param {string} fetchOptions.operationName - The name of the fetch operation that will appear in
 * the retry related log entries.
 * @param {number} maxRetries - How many times will retry the request.
 * @returns {Promise<Object>} - A promise resolved with the JSON parsed from the response.
 */
function fetchWithRetry(fetchOptions, maxRetries = 3) {
    const { url, requestOptions, operationName } = fetchOptions;
    let retry = 0;

    /**
     * A private function used to perform the fetch request while keeping access
     * the retry count through a closure.
     *
     * @returns {Promise<Object>}
     */
    function internalFetchWithRetry() {
        return new Promise((resolve, reject) => {
            fetch(url, requestOptions)
                .then(response => {
                    if (!response.ok) {
                        const error
                            = `Failed to ${operationName}:`
                                + `${response.statusText}, HTTP code: ${response.status}`;

                        if (status < 500 && status >= 600) {
                            // Break the retry chain
                            reject(error);

                            return;
                        }

                        // Throw and retry
                        throw Error(error);
                    }

                    // Return result as JSON
                    resolve(response.json());
                })
                .catch(error => {
                    if (retry >= maxRetries) {
                        logger.log(`${operationName}  - maximum retries exceeded`);
                        reject(error);

                        return;
                    }

                    retry = retry + 1;
                    const timeout = _getNextTimeout(retry);

                    logger.log(`${operationName} retry: ${retry} delay: ${timeout}`);

                    setTimeout(() => {
                        internalFetchWithRetry()
                            .then(resolve, reject);
                    }, timeout);
                });
        });
    }

    return internalFetchWithRetry();
}

/**
 * Contacts the backend service in order to get the join code assigned to this device.
 *
 * @param {string} serviceEndpointUrl - The URL pointing to the service.
 * @returns {Promise<string>}
 */
export function fetchJoinCode(serviceEndpointUrl) {
    const requestOptions = {
        headers: {
            'content-type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({
            deviceId: getDeviceId()
        }),
        method: 'POST',
        mode: 'cors'
    };

    return fetchWithRetry({
        operationName: 'fetch the join code',
        requestOptions,
        url: serviceEndpointUrl
    })
        .then(json => {
            if (!json.joinCode) {
                throw new Error(`No 'joinCode' in the response: ${JSON.stringify(json)}`);
            }

            return json.joinCode;
        });
}

/**
 * @typedef {Object} SpotRoomInfo
 * @property {string} roomName - the name of the MUC room assigned for the Spot's join code which
 * tells where both Spot TV and Spot Remote have to go in order to establish the connection.
 */
/**
 * Contacts the backend service which assigns the MUC room names for Spot join codes.
 *
 * @param {string} serviceEndpointUrl - The URL which points to the service.
 * @param {string} joinCode - The join code for which the MUC room name is to be retrieved.
 * @returns {Promise<SpotRoomInfo>}
 */
export function fetchRoomInfo(serviceEndpointUrl, joinCode) {
    if (!joinCode) {
        return Promise.reject('The \'joinCode\' argument is required');
    }

    const requestOptions = {
        method: 'GET',
        mode: 'cors'
    };

    return fetchWithRetry({
        operationName: 'get room info',
        requestOptions,
        url: `${serviceEndpointUrl}?joinCode=${joinCode}`
    })
        .then(json => {
            if (!json.roomName) {
                throw new Error(`No 'roomName' in the response: ${JSON.stringify(json)}`);
            }

            return {
                roomName: json.roomName
            };
        });
}
