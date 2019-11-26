/**
 * Checks if the Jitsi API is responsive.
 */
export default class ApiHealthCheck {
    /**
     * The amount of time to wait in milliseconds for the Jitsi API to return
     * a response.
     */
    static pingTimeLimitMs = 5000;

    /**
     * The amount of time to wait in milliseconds before sending a new request
     * into the Jitsi API.
     */
    static pingIntervalMs = 5000;

    /**
     * Initializes a new {@code ApiHealthCheck} instance.
     *
     * @param {Object} jitsiApi - An instance of JitsiMeetExternalAPI.
     * @param {Function} onError - Callback to invoke when a health check fails.
     */
    constructor(jitsiApi, onError) {
        this._jitsiApi = jitsiApi;
        this._onError = onError;

        this._isRunning = false;
    }

    /**
     * Begins polling the Jitsi API to check if the iFrame is responsive.
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
     * Exercises a request to the Jitsi API and enqueues another request to be
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
     * Executes a request to the Jitsi API to check if the iFrame is responsive.
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

            // Using video mute is somewhat arbitrary. The intent is to invoke
            // a method that will make a request into the iframe itself to get a
            // response back. Video muting looked like an acceptable candidate
            // as no actual ping method exists.
            this._jitsiApi.isVideoMuted()
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
