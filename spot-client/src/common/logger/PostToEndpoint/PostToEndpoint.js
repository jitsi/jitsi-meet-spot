import throttle from 'lodash.throttle';

import internalLogger from './internalLogger';
import LogQueue from './LogQueue';
import PostLogsRequest from './PostLogsRequest';

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
     * @param {string} endpointUrl - The URL for which to send POSTs.
     */
    constructor({ deviceId, endpointUrl }) {
        this._deviceId = deviceId;
        this._endpointUrl = endpointUrl;
        this._logQueue = new LogQueue();
        this._requestInFlight = null;

        this._throttledSend = throttle(() => {
            this._sendLogs();
        }, 10000, { leading: false });
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
                    internalLogger.warn('re-duping events', event);

                    const jsonEvent = JSON.parse(event.text);

                    for (let i = 0; i < event.count; i++) {
                        accumulator.push(jsonEvent);
                    }

                    return accumulator;
                }

                accumulator.push(event);

                return accumulator;
            } catch (e) {
                internalLogger.error('Failed to parse event', e);

                return accumulator;
            }
        }, []);

        this._logQueue.addLogs(jsonEvents);

        // Make sure that there's only 1 request on the flight by starting
        // the reaction chain only if there's 1 request in the queue (the one
        // added above).
        if (!this._requestInFlight) {
            this._throttledSend();
        }
    }

    /**
     * Tries to send first log request from the requests queue. In case of
     * success it will keep taking requests off the queue until it's empty.
     *
     * @returns {void}
     * @private
     */
    _sendLogs() {
        if (this._requestInFlight) {
            return;
        }

        const events = this._logQueue.pullAllLogs();

        this._requestInFlight = new PostLogsRequest(
            events,
            this._deviceId,
            this._endpointUrl
        );

        this._requestInFlight.send()
            .catch(error => {
                internalLogger.error('Failed to send logs', error);
            })
            .then(() => {
                this._requestInFlight = null;

                if (this._logQueue.hasQueuedLogs()) {
                    this._throttledSend();
                }
            });
    }

    /**
     * Sets a new device ID which from now on will identify this client.
     *
     * @param {string} deviceId - A unique identifier for this client.
     * @returns {void}
     */
    setDeviceId(deviceId) {
        this._deviceId = deviceId;
    }
}
