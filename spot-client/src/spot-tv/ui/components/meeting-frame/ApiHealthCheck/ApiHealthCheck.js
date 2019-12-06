/**
 * Checks if the meeting integration iframe is responsive.
 */
export default class ApiHealthCheck {
    /**
     * The amount of time to wait in milliseconds for the health check function
     * to return a response.
     */
    static pingTimeLimitMs = 5000;

    /**
     * The amount of time to wait in milliseconds before executing the health
     * check function again
     */
    static pingIntervalMs = 5000;

    /**
     * Initializes a new {@code ApiHealthCheck} instance.
     *
     * @param {Object} healthCheckFunction - The function to invoke that checks
     * the health of the iframe.
     * @param {Function} onError - Callback to invoke when a health check fails.
     */
    constructor(healthCheckFunction, onError) {
        this._healthCheckFunction = healthCheckFunction;
        this._onError = onError;

        this._isRunning = false;
    }

    /**
     * Begins calling the health check function at an interval to check if the
     * iframe is responsive.
     *
     * @returns {void}
     */
    start() {
        if (this._isRunning) {
            return;
        }

        this._isRunning = true;

        this._checkHealth();
    }

    /**
     * Stops any polling in progress and prevents this {@code ApiHealthCheck}
     * instance from polling again.
     *
     * @returns {void}
     */
    stop() {
        this._isRunning = false;

        clearTimeout(this._checkHealthTaskHandle);
    }

    /**
     * Exercises the health check function and enqueues another request to be
     * made in the future.
     *
     * @private
     * @returns {void}
     */
    _checkHealth() {
        this._pingApi()
            .then(() => {
                if (!this._isRunning) {
                    return;
                }

                this._checkHealthTaskHandle = setTimeout(
                    () => this._checkHealth(),
                    ApiHealthCheck.pingIntervalMs
                );
            }, reason => {
                if (!this._isRunning) {
                    return;
                }

                this._onError(reason);
            });
    }

    /**
     * Executes a request into the iframe to check if the iFrame is responsive.
     * Times out if no response is received within a defined time limit.
     *
     * @private
     * @returns {Promise}
     */
    _pingApi() {
        return new Promise((resolve, reject) => {
            const timeLimitExceededTimeout = setTimeout(() => {
                reject('health-check-time-limit-exceeded');
            }, ApiHealthCheck.pingTimeLimitMs);

            this._healthCheckFunction()
                .then(() => {
                    clearTimeout(timeLimitExceededTimeout);

                    resolve();
                }, () => {
                    clearTimeout(timeLimitExceededTimeout);

                    reject('health-check-request-failed');
                });
        });
    }
}
