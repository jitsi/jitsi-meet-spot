import { logger } from 'common/logger';
import { generateGuid, getJitterDelay } from 'common/utils';

import { errorConstants } from './constants';

/**
 * Converts 'emitted' string date to a milliseconds date since the epoch and calculates the expiration date in
 * milliseconds since the epoch based on given 'expiresIn' value.
 *
 * @param emitted - A string with a number in milliseconds which is a date/time when a token/something
 * has been emitted.
 * @param expiresIn - A string with a number of milliseconds which is validity period of a token.
 * @returns - An object with the computed expiration date.
 */
function convertToExpires(
        { emitted, expiresIn }: { emitted: string; expiresIn: string | number; }
): { expires: number; } {
    const emittedMillis = Number(emitted);

    return {
        expires: emittedMillis + Number(expiresIn)
    };
}

/**
 * Helper for creating a Headers instance for a request.
 *
 * @param jwt - Options authorization to add to the request.
 * @private
 * @returns - The created Headers instance.
 */
function createHeaders(jwt?: string): Headers {
    const headerOptions: Record<string, string> = {
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
 * Retrieves spot-client version from  the current deployment.
 *
 * @param versionFileUrl - The URL pointing to JSON version file.
 * @returns - A promise resolved with the spot-client version.
 */
export function fetchSpotClientVersion(versionFileUrl: string): Promise<string | undefined> {
    return fetchWithRetry({
        url: versionFileUrl,
        operationName: 'fetch spot client version'
    }).then(json => json?.spotClientVersion);
}

/**
 * Options related to the fetch request.
 */
interface FetchOptions {

    /**
     * The name of the fetch operation that will appear in the retry related log entries.
     */
    operationName: string;

    /**
     * The options to be passed to the fetch function.
     */
    requestOptions?: any;

    /**
     * The URL to be passed to the fetch function.
     */
    url: string;
}

/**
 * Sends HTTP request using {@code fetch} with retries on network and server errors.
 *
 * @param fetchOptions - Options related to the fetch request.
 * @param maxRetries - How many times will retry the request.
 * @returns - A promise resolved with the JSON parsed from the response.
 */
function fetchWithRetry(fetchOptions: FetchOptions, maxRetries = 3): Promise<any> {
    const { url, requestOptions, operationName } = fetchOptions;

    let retry = 0;

    /**
     * This is the value passed to {@link getJitterDelay} as the retry counter. The variable was introduced, in order to
     * jump immediately into the highest jitter delay range on 5xx error. Otherwise it will follow the retry counter.
     */
    let delayLevel = 0;

    /**
     * A private function used to perform the fetch request while keeping access
     * the retry count through a closure.
     *
     * @returns - A promise resolved with the JSON parsed from the response.
     */
    function internalFetchWithRetry(): Promise<any> {
        return new Promise((resolve, reject) => {
            fetch(url, requestOptions)
                .then(response =>
                    response
                        .json()
                        .catch(() => {
                            /* Ignore json rejection */
                        })
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

                    const error
                        = `Failed to ${operationName}: ${response.statusText}, HTTP code: ${response.status}`;

                    logger.error(error, {
                        json,
                        requestId: requestOptions.headers.get('request-id')
                    });

                    const { status: httpStatusCode } = response;

                    // Bump the delay to the max level immediately on 5xx to give backend a breath
                    if (httpStatusCode >= 500 && httpStatusCode < 600) {
                        delayLevel = maxRetries;
                    }

                    if (
                        httpStatusCode === 401
                        || (httpStatusCode === 400 && json?.messageKey === 'pairing.code.not.found')
                    ) {
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

                    // Stop increasing the delay level if it's been already maxed out on 5xx error.
                    if (delayLevel + 1 <= maxRetries) {
                        delayLevel += 1;
                    }

                    const timeout = getJitterDelay(delayLevel, 500, 3);

                    logger.log(`${operationName} retry: ${retry} delay level: ${delayLevel} delay: ${timeout}`);

                    setTimeout(() => {
                        internalFetchWithRetry().then(resolve, reject);
                    }, timeout);
                });
        });
    }

    return internalFetchWithRetry();
}

/**
 * A calendar event as returned by the REST backend.
 */
export interface RESTBackendCalendarEvent {
    allDay: boolean;
    calendarId: string;
    description: string;

    /**
     * The end date as formatted with {@link Date.toISOString()}.
     */
    end: string;
    eventId: string;
    meetingLink: string;

    /**
     * The start date as formatted with {@link Date.toISOString()}.
     */
    start: string;

    /**
     * The title ?
     */
    summary: string;
    updatable: boolean;
}

/**
 * Retrieves the list of calendar events.
 *
 * @param serviceEndpointUrl - The URL pointing to the REST endpoint which serves
 * the calendar events.
 * @param jwt - The JWT required for authentication.
 * @returns - A promise resolved with the list of calendar events.
 */
export function fetchCalendarEvents(
        serviceEndpointUrl: string,
        jwt: string
): Promise<Array<RESTBackendCalendarEvent>> {
    let url = serviceEndpointUrl;

    if (!url.includes('{tzid}')) {
        return Promise.reject(`Missing {tzid} template in the URL: ${url}`);
    }

    if (!jwt) {
        return Promise.reject('JWT is required to request calendar events');
    }

     
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
 * The short lived pairing code.
 */
export interface RemotePairingInfo {

    /**
     * A date expressed in milliseconds since the epoch which indicates when the pairing code will expire.
     */
    expires: number;

    /**
     * A short lived remote pairing code to be used by Spot Remotes which connect only temporarily.
     */
    remotePairingCode: string;
}

/**
 * Obtains a short lived paring code to be used by Spot Remotes which do not stay connected to Spot TV for long periods
 * of time.
 *
 * @param serviceEndpointUrl - The URL pointing to the backend endpoint which provides short lived pairing
 * codes.
 * @param jwt - The access token used to authenticated with the service.
 * @returns - A promise resolved with the remote pairing info.
 */
export function getRemotePairingCode(serviceEndpointUrl: string, jwt: string): Promise<any> {
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
            ...convertToExpires(json)
        };
    });
}

/**
 * Checks if it's ok to call given phone number.
 *
 * @param serviceEndpointUrl - The URL pointing to the phone authorize service.
 * @param phoneNumber - E.164 formatted phone number to be checked.
 * @returns - A promise resolved when the phone number is authorized.
 */
export function phoneAuthorize(serviceEndpointUrl: string, phoneNumber: string): Promise<void> {
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
    }).then(({ message, allow }) => {
        if (typeof allow === 'undefined') {
            throw new Error('phoneAuthorize - no "allow" field in the response');
        }

        if (!allow) {
            throw message;
        }
    });
}

/**
 * The response of a token refresh request.
 */
export interface RefreshTokenResponse {

    /**
     * A new/refreshed access token.
     */
    accessToken: string;

    /**
     * A date expressed in milliseconds since the epoch which indicate when the token will expire.
     */
    expires: number;

    /**
     * A tenant name bound to specific customer for which Spot instance is being registered.
     */
    tenant?: string;
}

/**
 * Sends a token refresh request to get a fresh token, before the current one expires.
 *
 * @param serviceEndpointUrl - URL pointing to the token refresh service.
 * @param refreshToken -.
 * @returns - A promise resolved with the refreshed token info.
 */
export function refreshAccessToken(
        serviceEndpointUrl: string,
        { refreshToken }: { refreshToken: string; }
): Promise<any> {
    if (!refreshToken) {
        throw new Error('Refresh token is required');
    }

    const requestOptions = {
        body: JSON.stringify({
            refreshToken
        }),
        headers: createHeaders(),
        method: 'PUT',
        mode: 'cors'
    };

    return fetchWithRetry({
        operationName: 'refresh token',
        requestOptions,
        url: serviceEndpointUrl
    }).then(json => {
        const { accessToken: newAccessToken, emitted, expiresIn, tenant } = json;

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
            ...convertToExpires(json)
        };
    });
}

/**
 * The registration info of a Spot TV.
 */
export interface SpotRegistration {

    /**
     * The authorization token to be used by a Spot TV instance for accessing other services.
     */
    accessToken: string;

    /**
     * An endpoint ID assigned by the backend which is used to identify the device. It should be persisted on the
     * client side and used in future "register" requests.
     */
    endpointId?: string;

    /**
     * A date expressed in milliseconds since the epoch which indicate when the token will expire.
     */
    expires: number;

    /**
     * The token used to refresh the authorization. Present only in a permanent type of pairing.
     */
    refreshToken?: string;

    /**
     * A tenant name bound to specific customer for which Spot instance is being registered.
     */
    tenant?: string;
}

/**
 * Authenticates with the backend service.
 *
 * @param serviceEndpointUrl - The URL pointing to the service.
 * @param pairingCode - The pairing code to be used to connect Spot TV and Spot Remote through the pairing
 * service.
 * @param assignedEndpointId - The endpoint ID assigned by the backend.
 * See {@link SpotRegistration.endpointId}.
 * @returns - A promise resolved with the Spot registration info.
 */
export function registerDevice(
        serviceEndpointUrl: string,
        pairingCode: string,
        assignedEndpointId?: string
): Promise<any> {
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
    }).then(json => {
        const { accessToken, emitted, endpointId, expiresIn, refreshToken, tenant } = json;

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
            ...convertToExpires(json)
        };
    });
}

/**
 * Information about a Spot room as returned by the backend.
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
export interface BackendRoomInfo {

    /**
     * ISO 3166-1 alpha-2 country code for the room's location.
     */
    countryCode: string;

    /**
     * The customer ID assigned by the backend for the room's owner.
     */
    customerId: string;

    /**
     * The password which needs to be entered on Spot TV in order to close it.
     */
    endpointPassword?: string;

    /**
     * The name of the MUC room assigned for the Spot's join code which tells where both Spot TV and Spot Remote have
     * to go in order to establish the connection.
     */
    mucUrl: string;

    /**
     * The Spot room's display name.
     */
    name: string;
}

/**
 * Contacts the backend service which assigns the MUC room names for Spot join codes.
 *
 * @param serviceEndpointUrl - The URL which points to the service.
 * @param jwt - The access token used to authenticate with the backend.
 * @returns - A promise resolved with the backend room info.
 */
export function fetchRoomInfo(serviceEndpointUrl: string, jwt: string): Promise<any> {
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
    }).then(json => {
        if (!json.mucUrl) {
            throw new Error('No "mucUrl" in the response');
        }

        return {
            countryCode: json.countryCode,
            customerId: json.customerId,
            endpointPassword: json.endpointPassword,
            id: json.id,
            mucUrl: json.mucUrl,
            name: json.name
        };
    });
}
