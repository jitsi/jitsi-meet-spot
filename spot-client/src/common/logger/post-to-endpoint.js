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
        // The endpoint likely expects the events to be an array of objects,
        // whereas the jitsi-meet-logger returns an array of strings.
        const jsonEvents = events.reduce((accumulator, event) => {
            try {
                // For duplicate events jitsi-meet-logger will batch them
                // and put them into an object instead of leaving each event
                // as a string. So re-dupe them to get accurate logs.
                if (event.text) {
                    // eslint-disable-next-line no-console
                    console.warn('re-duping events', event);

                    const jsonEvent = JSON.parse(event.text);

                    for (let i = 0; i < event.count; i++) {
                        accumulator.push(jsonEvent);
                    }

                    return accumulator;
                }

                accumulator.push(JSON.parse(event));

                return accumulator;
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('Failed to parse event', e);

                return accumulator;
            }
        }, []);

        return fetch(
            this._endpointUrl,
            {
                body: JSON.stringify({
                    events: jsonEvents,
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
