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
        mode: 'cors'
    })
        .then(response => response.json())
        .then(({ signature }) => signature);
}
