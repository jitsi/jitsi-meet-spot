import { getDeviceId } from 'common/utils/device-id';

/**
 * FIXME.
 *
 * @param {string} serviceEndpointUrl - FIXME.
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

    return fetch(serviceEndpointUrl, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw Error(
                    'Failed to fetch the join code:'
                     + `${response.statusText}, HTTP code: ${response.status}`);
            }

            return response.json();
        })
        .then(json => {
            if (!json.joinCode) {
                throw new Error(`No 'joinCode' in the response: ${JSON.stringify(json)}`);
            }

            return json.joinCode;
        });
}

/**
 * FIXME.
 *
 * @param {string} serviceEndpointUrl - FIXME.
 * @param {string} joinCode - FIXME.
 * @returns {Promise<Object>}
 */
export function fetchRoomInfo(serviceEndpointUrl, joinCode) {
    if (!joinCode) {
        return Promise.reject('The \'joinCode\' argument is required');
    }

    const requestOptions = {
        method: 'GET',
        mode: 'cors'
    };

    return fetch(`${serviceEndpointUrl}?joinCode=${joinCode}`, requestOptions)
        .then(response => {
            // FIXME error handling is duplicated with the 'fetchJoinCode'
            if (!response.ok) {
                throw Error(
                    'Failed to fetch the join code:'
                    + `${response.statusText}, HTTP code: ${response.status}`);
            }

            return response.json();
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
