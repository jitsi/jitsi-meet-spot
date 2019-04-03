import { getJitterDelay } from 'common/utils';

/**
 * The structure holds the meta data about the log requests waiting in the queue
 * to be sent.
 */
class PostLogsRequest {
    /**
     * Creates new {@code PostLogsRequest}.
     *
     * @param {number} retry - Tracks the retry attempts starting from 0 which
     * is not a retry yet.
     * @param {Array<string>} events - The JSON events as formatted in
     * {@link PostToEndpoint#send}.
     */
    constructor(retry, events) {
        this.retry = retry;
        this.events = events;
    }
}

/**
 * A lightweight class for sending a POST to an endpoint with collected logs.
 */
export default class PostToEndpoint {
    /**
     * How many times it'll retry to send a log batch.
     * @type {number}
     */
    static MAX_RETRIES = 3;

    /**
     * Gets next timeout using the full jitter pattern.
     *
     * @param {number} retry - The retry number. It's 1 on the first retry.
     * @returns {number} - The amount of waiting before trying another time
     * given in milliseconds.
     * @private
     */
    static _getNextTimeout(retry) {
        // 1st retry 500 - 3 seconds
        // 2nd retry 500 - 9 seconds
        // 3rd retry 500 - 27 seconds
        return getJitterDelay(retry, /* min delay */ 500, /* base */ 3);
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

        this._requestsQueue.push(new PostLogsRequest(/* retry # */ 0, jsonEvents));

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
     * the {@link PostToEndpoint#MAX_RETRIES} is reached.
     *
     * @returns {void}
     * @private
     */
    _sendLogs() {
        const request = this._requestsQueue.length && this._requestsQueue[0];

        if (!request) {
            return;
        }

        const { retry, events } = request;

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

            if (!ok) {
                // Throwing will cause a retry on server errors
                if (status >= 500 && status < 600) {
                    throw new Error(`Request error - status: ${status}`);
                }
                // eslint-disable-next-line no-console
                console.warn(`Dropping log request, status: ${status}`);
            }

            return true;
        })
        .catch(error => {
            // eslint-disable-next-line no-console
            console.error(`Log request error, attempt: ${retry + 1}`, error);

            if (retry < PostToEndpoint.MAX_RETRIES) {
                request.retry += 1;
                window.setTimeout(
                    () => this._sendLogs(),
                    PostToEndpoint._getNextTimeout(request.retry));

                return false;
            }

            // eslint-disable-next-line no-console
            console.warn('Dropped log request - retry limit exceeded');

            return true;
        })
        .then(proceedWithNext => {
            if (proceedWithNext) {
                // Remove the request from the queue and try the next one
                this._requestsQueue.shift();
                this._sendLogs();
            }
        });
    }
}
