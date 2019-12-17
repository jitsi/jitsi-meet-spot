import fetch from 'fetch-retry';

import { logger } from 'common/logger';
import { getJitterDelay } from 'common/utils';

/**
 * Communicates with 'spot-intebration-service' in order to get a Zoom signature generated for the meeting.
 *
 * @param {string} apiKey - The ZOOM API key assigned to the app.
 * @param {string} serviceUrl - The meeting signature service URL.
 * @param {string} meetingNumber - The ZOOM meeting number for which a signature is to be generated.
 * @returns {Promise<string>}
 */
export function fetchMeetingSignature(apiKey, serviceUrl, meetingNumber) {
    return fetch(`${serviceUrl}`, {
        body: JSON.stringify({
            apiKey,
            meetingNumber,
            role: 0
        }),
        headers: {
            'content-type': 'application/json'
        },
        method: 'POST',
        mode: 'cors',
        retries: 3,
        retryOn: (attempt, error, response) => error !== null || response.status >= 500,
        retryDelay: attempt => getJitterDelay(attempt, 1000, 3)
    })
        .then(response => response.json().then(json => {
            if (!response.ok) {
                logger.error('fetchMeetingSignature failed', {
                    status: response.status,
                    statusText: response.statusText,
                    json
                });

                return Promise.reject('fetchMeetingSignature failed');
            }

            return json;
        }))
        .then(({ signature }) => signature);
}
