import { getJitterDelay } from 'common/utils';

import internalLogger from './internalLogger';

/**
 * The structure holds the meta data about the log requests waiting in the queue
 * to be sent.
 */
export default class PostLogsRequest {
    static MAX_RETRIES = 3;

    events: Array<string>;
    deviceId: string;
    endpointUrl: string;
    retry: number;

    /**
     * Creates new {@code PostLogsRequest}.
     *
     * @param events - The JSON events as formatted in
     * {@link PostToEndpoint#send}.
     * @param deviceId - Local identifier for who is sending the logs.
     * @param endpointUrl - Where to send the logs.
     */
    constructor(events: Array<string>, deviceId: string, endpointUrl: string) {
        this.events = events;
        this.deviceId = deviceId;
        this.endpointUrl = endpointUrl;

        this.retry = 0;
    }

    /**
     * Executes the async action of sending logs. Will retry on failure.
     *
     * @returns
     */
    send(): Promise<void> {
        return fetch(
            this.endpointUrl,
            {
                body: JSON.stringify({
                    events: this.events,
                    'device_id': this.deviceId
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                mode: 'cors'
            }
        )
        .then(response => {
            const { ok, status } = response;

            if (!ok) {
                // Throwing will cause a retry on server errors
                if (status >= 500 && status < 600) {
                    throw new Error(`Request error - status: ${status}`);
                }

                internalLogger.warn(`Dropping log request, status: ${status}`);
            }
        })
        .catch(error => {
            internalLogger.error(`Log request error, attempt: ${this.retry + 1}`, error);

            if (this.retry < PostLogsRequest.MAX_RETRIES) {
                this.retry = this.retry + 1;

                const timeout = PostLogsRequest._getNextTimeout(this.retry);


                return new Promise<void>((resolve, reject) => {
                    setTimeout(
                        () => {
                            this.send()
                                .then(resolve)
                                .catch(reject);
                        },
                        timeout
                    );
                });
            }

            internalLogger.warn('Dropped log request - retry limit exceeded');

            return Promise.reject('dropped');
        });
    }

    /**
     * Gets next timeout using the full jitter pattern.
     *
     * @param retry - The retry number. It's 1 on the first retry.
     * @returns - The amount of waiting before trying another time
     * given in milliseconds.
     * @private
     */
    static _getNextTimeout(retry: number): number {
        // 1st retry 10 seconds
        // 2nd retry 10 seconds
        // 3rd retry 10 - 27 seconds
        return getJitterDelay(retry, /* min delay */ 10000, /* base */ 3);
    }

}
