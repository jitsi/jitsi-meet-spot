
import Logger from 'jitsi-meet-logger';

/**
 * A class responsible for aggregating logs and sending them to a third party
 * for recording. Leverages jitsi-meet-logger, which automatically records all
 * jitsi-meet-logger logs.
 */
export default class LoggingService {
    /**
     * Creates a new instance of {@code LoggingService} and registers itself
     * to receive logs.
     */
    constructor() {
        this._logCollector = new Logger.LogCollector(
            {
                isReady: this.isReady.bind(this),
                storeLogs: this.storeLogs.bind(this)
            },
            {
                storeInterval: 1000
            }
        );

        Logger.addGlobalTransport(this._logCollector);
    }

    /**
     * Callback invoked by jitsi-meet-logger to detect if cached logs should be
     * passed into the storeLogs callback.
     *
     * @returns {boolean}
     */
    isReady() {
        return true;
    }

    /**
     * Sets logs to be sent to a third party log collecting service.
     *
     * @returns {void}
     */
    start() {
        this._logCollector.start();
    }

    /**
     * Sets logs not to be sent to a third party log collecting service.
     *
     * @returns {void}
     */
    stop() {
        this._logCollector.stop();
    }

    /**
     * Callback invoked by jitsi-meet-logger when it has batched logs for a
     * given storeInterval.
     *
     * @returns {void}
     */
    storeLogs() {
        /** TODO: implementing sending the logs to a service */
    }
}
