import { logger } from 'common/logger';
import { generateGuid, getJitterDelay } from 'common/utils';

import { errorConstants } from './constants';

/**
 * Converts 'emitted' string date to a milliseconds date since the epoch and calculates the expiration date in
 * milliseconds since the epoch based on given 'expiresIn' value.
 *
 * @param {string} emitted - A string with a number in milliseconds which is a date/time when a token/something
 * has been emitted.
 * @param {string|number} expiresIn - A string with a number of milliseconds which is validity period of a token.
 * @returns {{
 *     emitted: number,
 *     expires: number
 * }}
 */
function convertToEmittedAndExpires({ emitted, expiresIn }) {
    const emittedMillis = Number(emitted);

    return {
        emitted: emittedMillis,
        expires: emittedMillis + Number(expiresIn)
    };
}

/**
 * Helper for creating a Headers instance for a request.
 *
 * @param {string} [jwt] - Options authorization to add to the request.
 * @private
 * @returns {Headers}
 */
function createHeaders(jwt) {
    const headerOptions = {
        accept: 'application/json',
        'content-type': 'application/json; charset=UTF-8',
        'request-id': generateGuid()
    };

    if (jwt) {
        headerOptions.authorization = `Bearer ${jwt}`;
    }

    return new Headers(headerOptions);
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
                .then(response => response.json()
                    .catch(() => { /* Ignore json rejection */ })
                    .then(json => {
                        return {
                            response,
                            json
                        };
                    })
                )
                .then(({ response, json }) => {
                    if (response.ok) {
                        resolve(json);

                        return;
                    }

                    const error = `Failed to ${operationName}:`
                        + `${response.statusText}, HTTP code: ${response.status}`;

                    logger.error(error, {
                        json,
                        requestId: requestOptions.headers.get('request-id')
                    });

                    const { status: httpStatusCode } = response;

                    if (httpStatusCode === 401
                        || (httpStatusCode === 400 && json?.messageKey === 'pairing.code.not.found')) {
                        reject(errorConstants.NOT_AUTHORIZED);

                        return;
                    } else if (httpStatusCode < 500 || httpStatusCode >= 600) {
                        // Break the retry chain early
                        reject(errorConstants.REQUEST_FAILED);

                        return;
                    }

                    // Throw and retry
                    throw Error(error);
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
 * @param {string} jwt - The JWT required for authentication.
 * @returns {Promise<Array<RESTBackendCalendarEvent>>}
 */
export function fetchCalendarEvents(serviceEndpointUrl, jwt) {
    let url = serviceEndpointUrl;

    if (!url.includes('{tzid}')) {
        return Promise.reject(`Missing {tzid} template in the URL: ${url}`);
    }

    if (!jwt) {
        return Promise.reject('JWT is required to request calendar events');
    }

    // eslint-disable-next-line new-cap
    url = url.replace('{tzid}', Intl.DateTimeFormat().resolvedOptions().timeZone);

    const requestOptions = {
        headers: createHeaders(jwt),
        method: 'GET',
        mode: 'cors'
    };

    return fetchWithRetry({
        operationName: 'get calendar events',
        requestOptions,
        url
    });
}

/**
 * @typedef {Object} RemotePairingInfo - the short lived paring code.
 * @property {number} emitted - A date expressed in milliseconds since the epoch which indicates when
 * the pairing code has been emitted.
 * @property {number} expires - A date expressed in milliseconds since the epoch which indicates when
 * the pairing code will expire.
 * @property {string} remotePairingCode - A short lived remote pairing code to be used by Spot Remotes which connect
 * only temporarily.
 */
/**
 * Obtains a short lived paring code to be used by Spot Remotes which do not stay connected to Spot TV for long periods
 * of time.
 *
 * @param {string} serviceEndpointUrl - The URL pointing to the backend endpoint which provides short lived pairing
 * codes.
 * @param {string} jwt - The access token used to authenticated with the service.
 * @returns {Promise<RemotePairingInfo>}
 */
export function getRemotePairingCode(serviceEndpointUrl, jwt) {
    if (!jwt) {
        return Promise.reject('The JWT is required');
    }

    const requestOptions = {
        headers: createHeaders(jwt),
        method: 'POST',
        mode: 'cors'
    };

    return fetchWithRetry({
        operationName: 'get remote pairing code',
        requestOptions,
        url: serviceEndpointUrl
    }).then(json => {
        const { emitted, expiresIn, code } = json;

        if (!emitted) {
            throw new Error('No "emitted" in the response');
        } else if (!expiresIn) {
            throw new Error('No "expiresIn" in the response');
        } else if (!code) {
            throw new Error('No "code" in the response');
        }

        return {
            code,
            ...convertToEmittedAndExpires(json)
        };
    });
}

/**
 * Checks if it's ok to call given phone number.
 *
 * @param {string} serviceEndpointUrl - The URL pointing to the phone authorize service.
 * @param {string} phoneNumber - E.164 formatted phone number to be checked.
 * @returns {Promise<void>}
 */
export function phoneAuthorize(serviceEndpointUrl, phoneNumber) {
    if (!serviceEndpointUrl) {
        return Promise.reject('phoneAuthorize - serviceEndpointUrl is required');
    }

    if (!phoneNumber) {
        return Promise.reject('phoneAuthorize - phoneNumber is required');
    }

    const requestOptions = {
        headers: createHeaders(),
        method: 'GET',
        mode: 'cors'
    };

    return fetchWithRetry({
        operationName: 'phoneAuthorize',
        requestOptions,
        url: `${serviceEndpointUrl}?phone=${encodeURIComponent(phoneNumber)}`
    })
        .then(({ message, allow }) => {
            if (typeof allow === 'undefined') {
                throw new Error('phoneAuthorize - no "allow" field in the response');
            }

            if (!allow) {
                throw message;
            }
        });
}

/**
 * @typedef {Object} RefreshTokenResponse
 * @property {string} accessToken - A new/refreshed access token.
 * @property {number} emitted - A date expressed in milliseconds since the epoch which indicate when
 * the token has been emitted.
 * @property {number} expires - A date expressed in milliseconds since the epoch which indicate when
 * the token will expire.
 * @property {string} [tenant] - A tenant name bound to specific customer for which Spot instance is being registered.
 */
/**
 * Sends a token refresh request to get a fresh token, before the current one expires.
 *
 * @param {string} serviceEndpointUrl - URL pointing to the token refresh service.
 * @param {string} accessToken -
 * @param {string} refreshToken -
 * @returns {Promise<RefreshTokenResponse>}
 */
export function refreshAccessToken(serviceEndpointUrl, { accessToken, refreshToken }) {
    if (!accessToken) {
        throw new Error('Access token is required');
    }
    if (!refreshToken) {
        throw new Error('Refresh token is required');
    }

    const requestOptions = {
        body: JSON.stringify({
            refreshToken
        }),
        headers: createHeaders(accessToken),
        method: 'PUT',
        mode: 'cors'
    };

    return fetchWithRetry({
        operationName: 'refresh token',
        requestOptions,
        url: serviceEndpointUrl
    })
        .then(json => {
            const {
                accessToken: newAccessToken,
                emitted,
                expiresIn,
                tenant
            } = json;

            if (!newAccessToken) {
                throw new Error('No "accessToken" field in the response');
            } else if (!emitted) {
                throw new Error('No "emitted" field in the response');
            } else if (!expiresIn) {
                throw new Error('No "expiresIn" field in the response');
            }

            return {
                accessToken: newAccessToken,
                refreshToken,
                tenant,
                ...convertToEmittedAndExpires(json)
            };
        });
}

/**
 * @typedef {Object} SpotRegistration
 * @property {string} accessToken - The authorization token to be used by a Spot TV
 * instance for accessing other services.
 * @property {number} emitted - A date expressed in milliseconds since the epoch which indicate when
 * the token has been emitted.
 * @property {string} [endpointId] - An endpoint ID assigned by the backend which is used to identify the device. It
 * should be persisted on the client side and used in future "register" requests.
 * @property {number} expires - A date expressed in milliseconds since the epoch which indicate when
 * the token will expire.
 * @property {string} [refreshToken] - The token used to refresh the authorization. Present only in
 * a permanent type of pairing.
 * @property {string} [tenant] - A tenant name bound to specific customer for which Spot instance is being registered.
 */
/**
 * Authenticates with the backend service.
 *
 * @param {string} serviceEndpointUrl - The URL pointing to the service.
 * @param {string} pairingCode - The pairing code to be used to connect Spot TV and Spot Remote through the pairing
 * service.
 * @param {string} [assignedEndpointId] - The endpoint ID assigned by the backend.
 * See {@link SpotRegistration.endpointId}.
 * @returns {Promise<SpotRegistration>}
 */
export function registerDevice(serviceEndpointUrl, pairingCode, assignedEndpointId) {
    const requestOptions = {
        headers: createHeaders(),
        body: JSON.stringify({
            endpointId: assignedEndpointId,
            pairingCode
        }),
        method: 'PUT',
        mode: 'cors'
    };

    return fetchWithRetry({
        operationName: 'pair device',
        requestOptions,
        url: serviceEndpointUrl
    })
        .then(json => {
            const {
                accessToken,
                emitted,
                endpointId,
                expiresIn,
                refreshToken,
                tenant
            } = json;

            if (!accessToken) {
                throw new Error('No "accessToken" field in the response');
            } else if (!emitted) {
                throw new Error('No "emitted" field in the response');
            } else if (!expiresIn) {
                throw new Error('No "expiresIn" field in the response');
            }

            return {
                accessToken,
                endpointId,
                refreshToken,
                tenant,
                ...convertToEmittedAndExpires(json)
            };
        });
}

/**
 * @typedef {Object} BackendRoomInfo
 * @property {string} mucUrl - The name of the MUC room assigned for the Spot's join code which
 * tells where both Spot TV and Spot Remote have to go in order to establish the connection.
 * @property {string} name - The Spot room's display name.
 * @property {string} countryCode - ISO 3166-1 alpha-2 country code for the room's location.
 *
 * {
 *   "calendarAccountId": "string",
 *   "customerId": "string",
 *   "id": "string",
 *   "location": "string",
 *   "countryCode": "string",
 *   "mucUrl": "string",
 *   "name": "string",
 *   "pairingCode": {
 *     "code": "string",
 *     "emitted": "2019-05-28T17:58:32.767Z",
 *     "expiresIn": 0,
 *     "id": "string",
 *     "pairingType": "SHORT_LIVED",
 *     "roomId": "string"
 *   },
 *   "resourceEmail": "string"
 * }.
 */
/**
 * Contacts the backend service which assigns the MUC room names for Spot join codes.
 *
 * @param {string} serviceEndpointUrl - The URL which points to the service.
 * @param {string} jwt - The access token used to authenticate with the backend.
 * @returns {Promise<BackendRoomInfo>}
 */
export function fetchRoomInfo(serviceEndpointUrl, jwt) {
    if (!jwt) {
        return Promise.reject('The \'jwt\' argument is required');
    }

    const requestOptions = {
        headers: createHeaders(jwt),
        method: 'GET',
        mode: 'cors'
    };

    return fetchWithRetry({
        operationName: 'get room info',
        requestOptions,
        url: serviceEndpointUrl
    })
        .then(json => {
            if (!json.mucUrl) {
                throw new Error('No "mucUrl" in the response');
            }

            return {
                countryCode: json.countryCode,
                id: json.id,
                mucUrl: json.mucUrl,
                name: json.name
            };
        });
}
