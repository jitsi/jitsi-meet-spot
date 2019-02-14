/**
 * A lightweight class for sending a POST to an endpoint with collected logs.
 */
export default class PostToEndpoint {
    /**
     * Initializes a new {@code PostToEndpoint} instance.
     *
     * @param {Object} options - Configuration for how the instance should send
     * logs.
     * @param {string} deviceId - A unique identifier for this client.
     * @param {string} endpoint - The URL for which to send POSTs.
     */
    constructor({ deviceId, endpointUrl }) {
        this._deviceId = deviceId;
        this._endpointUrl = endpointUrl;
    }

    /**
     * Invoked to send logs to a logging service.
     *
     * @param {Array<string>} events - The log statements with meta data. The
     * jitsi-meet-logger stores the objects as strings.
     * @returns {void}
     */
    send(events) {
        return fetch(
            this._endpointUrl,
            {
                body: JSON.stringify({
                    events: events.map(event => JSON.parse(event)),
                    'device_id': this._deviceId
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                mode: 'cors'
            }
        );
    }
}
