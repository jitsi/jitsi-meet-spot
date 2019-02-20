
/**
 * The structure holds the meta data about the log requests waiting in the queue
 * to be sent.
 */
class PostLogsRequest {
    /**
     * Creates new {@code PostLogsRequest}.
     *
     * @param {number} attempt - The send attempt starting from 1.
     * @param {Array<string>} events - The JSON events as formatted in
     * {@link PostToEndpoint#send}.
     */
    constructor(attempt, events) {
        this.attempt = attempt;
        this.events = events;
    }
}

/**
 * A lightweight class for sending a POST to an endpoint with collected logs.
 */
export default class PostToEndpoint {
    /**
     * How many times it'll try to send a log batch.
     * @type {number}
     */
    static MAX_ATTEMPTS = 4;

    /**
     * Gets next timeout using the full jitter pattern.
     *
     * @param {number} attempt - The attempt number. On the first retry
     * the value is 2.
     * @returns {number} - The amount of waiting before trying another time
     * given in milliseconds.
     * @private
     */
    static _getNextTimeout(attempt) {
        // 1st retry 0 - 3 seconds
        // 2nd retry 0 - 9 seconds
        // 3rd retry 0 - 27 seconds
        return Math.floor(Math.random() * Math.pow(3, attempt) * 1000);
    }

    /**
     * Initializes a new {@code PostToEndpoint} instance.
     *
     * @param {Object} options - Configuration for how the instance should send
     * logs.
     * @param {string} deviceId - A unique identifier for this client.
     * @param {string} endpointUrl - The URL for which to send POSTs.
     */
    constructor({ deviceId, endpointUrl }) {
        this._deviceId = deviceId;
        this._endpointUrl = endpointUrl;
        this._requestsQueue = [];
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

        this._requestsQueue.push(
            new PostLogsRequest(/* attempt */ 1, jsonEvents));

        // Make sure that there's only 1 request on the flight by starting
        // the reaction chain only if there's 1 request in the queue (the one
        // added above).
        if (this._requestsQueue.length === 1) {
            this._sendLogs();
        }
    }

    /**
     * Tries to send first log request from the requests queue. In case of
     * success it will keep taking requests of the queue until it's empty.
     * On failure it will retry the request with a delay until
     * the {@link PostToEndpoint#MAX_ATTEMPTS} is reached.
     *
     * @returns {void}
     * @private
     */
    _sendLogs() {
        const request = this._requestsQueue.shift();

        if (request) {
            const { attempt, events } = request;

            fetch(
                this._endpointUrl,
                {
                    body: JSON.stringify({
                        events,
                        'device_id': this._deviceId
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    mode: 'cors'
                }
            ).then(response => {
                const { ok, status } = response;

                if (!ok && status >= 500 && status < 600) {
                    // Retry on server errors and network failures which
                    // is a regular fetch reject case.
                    throw new Error(`Request error - status: ${status}`);
                } else if (ok) {
                    // Try sending the next request from the queue
                    this._sendLogs();
                } else {
                    // eslint-disable-next-line no-console
                    console.warn(`Dropping log request, status: ${status}`);
                }
            })
            .catch(error => {
                // eslint-disable-next-line no-console
                console.error(`Log request error, attempt: ${attempt}`, error);

                if (attempt < PostToEndpoint.MAX_ATTEMPTS) {
                    // Put the current request back at the front of the queue
                    this._requestsQueue.unshift(
                        new PostLogsRequest(attempt + 1, events));
                    window.setTimeout(
                        () => this._sendLogs(),
                        PostToEndpoint._getNextTimeout(attempt));
                } else {
                    // eslint-disable-next-line no-console
                    console.warn('Dropped log request - retry limit exceeded');
                }
            });
        }
    }
}
