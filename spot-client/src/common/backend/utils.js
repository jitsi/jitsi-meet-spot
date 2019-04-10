import { logger } from 'common/logger';
import { getDeviceId } from 'common/utils/device-id';
import { getJitterDelay } from 'common/utils/retry';

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

                        if (response.status < 500 && response.status >= 600) {
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
                    const timeout = getJitterDelay(retry, 500, 2);

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
 * @typedef {Object} RESTBackendCalendarEvent
 * @property {boolean} allDay
 * @property {string} calendarId
 * @property {string} description
 * @property {string} end - The end date as formatted with {@link Date.toISOString()}.
 * @property {string} eventId
 * @property {string} meetingLink
 * @property {string} start - The start date as formatted with {@link Date.toISOString()}.
 * @property {string} summary - The title ?
 * @property {boolean} updatable
 */
/**
 * Retrieves the list of calendar events.
 *
 * @param {string} serviceEndpointUrl - The URL pointing to the REST endpoint which serves
 * the calendar events.
 * @param {string} jwtToken - The JWT token required for authentication.
 * @returns {Promise<Array<RESTBackendCalendarEvent>>}
 */
export function fetchCalendarEvents(serviceEndpointUrl, jwtToken) {
    const requestOptions = {
        method: 'GET',
        mode: 'cors'
    };

    if (jwtToken) {
        requestOptions.headers = new Headers();
        requestOptions.headers.append('Authorization', `Bearer ${jwtToken}`);
        requestOptions.headers.append('Accept', 'application/json');
    }

    let url = serviceEndpointUrl;

    if (!url.includes('{tzid}')) {
        return Promise.reject(`Missing {tzid} template in the URL: ${url}`);
    }

    // eslint-disable-next-line new-cap
    url = url.replace('{tzid}', Intl.DateTimeFormat().resolvedOptions().timeZone);

    return fetchWithRetry({
        operationName: 'get calendar events',
        requestOptions,
        url
    });
}

/**
 * @typedef {Object} DeviceInfo
 * @property {string} joinCode
 * @property {string} jwt
 */
/**
 * Contacts the backend service in order to get the join code assigned to this device.
 *
 * @param {string} serviceEndpointUrl - The URL pointing to the service.
 * @returns {Promise<DeviceInfo>}
 */
export function registerDevice(serviceEndpointUrl) {
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

            return {
                joinCode: json.joinCode,
                jwt: json.jwt
            };
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
