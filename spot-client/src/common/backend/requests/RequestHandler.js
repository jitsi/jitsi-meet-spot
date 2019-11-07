import { logger } from 'common/logger';
import { getJitterDelay } from 'common/utils';
import { errorConstants } from './constants';

/**
 * FIXME.
 */
export class RequestHandler {
    /**
     * FIXME.
     */
    constructor({ delayBase = 3, minDelay = 500, maxDelayLevel = 0 }) {
        this.delayLevel = 0;
        this.delayBase = delayBase;
        this.minDelay = minDelay;
        this.maxDelayLevel = maxDelayLevel;
    }

    /**
     * Sends HTTP request using {@code fetch} with retries on network and server errors.
     *
     * @param {Object} fetchOptions - Options related to the fetch request.
     * @param {string} fetchOptions.url - The URL to be passed to the fetch function.
     * @param {Object} fetchOptions.requestOptions - The options to be passed to the fetch function.
     * @param {string} fetchOptions.operationName - The name of the fetch operation that will appear in
     * the retry related log entries.
     * @param {number} maxRetries - How many times will retry the request.
     * @returns {Promise<Object>} - A promise resolved with the JSON parsed from the response.
     */
    fetchWithRetry(fetchOptions, maxRetries = 3) {
        const { url, requestOptions, operationName } = fetchOptions;

        let retry = 0;

        /**
         * A private function used to perform the fetch request while keeping access
         * the retry count through a closure.
         *
         * @returns {Promise<Object>}
         */
        const internalFetchWithRetry
            = () => new Promise((resolve, reject) => {
                fetch(url, requestOptions)
                    .then(response => response.json()
                        .catch(() => { /* Ignore json rejection */ })
                        .then(json => {
                            return {
                                response,
                                json
                            };
                        })
                    )
                    .then(({ response, json }) => {
                        if (response.ok) {
                            this.delayLevel = 0;
                            resolve(json);

                            return;
                        }

                        const error = `Failed to ${operationName}:`
                            + `${response.statusText}, HTTP code: ${response.status}`;

                        logger.error(error, {
                            json,
                            requestId: requestOptions.headers.get('request-id')
                        });

                        const { status: httpStatusCode } = response;

                        if (httpStatusCode === 401
                            || (httpStatusCode === 400 && json?.messageKey === 'pairing.code.not.found')) {
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
                        this.delayLevel = Math.min(this.delayLevel + 1, this.maxDelayLevel);
                        const timeout = getJitterDelay(this.delayLevel, this.minDelay, this.delayBase);

                        logger.log(
                            `${operationName} retry: ${retry} delay lvl: ${this.delayLevel} delay: ${timeout}`);

                        setTimeout(() => {
                            internalFetchWithRetry()
                                .then(resolve, reject);
                        }, timeout);
                    });
            });

        return internalFetchWithRetry();
    }
}
