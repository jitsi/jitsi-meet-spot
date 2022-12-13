import Logger from '@jitsi/logger';

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
        this._handlers = new Set();

        this._logCollector = new Logger.LogCollector(
            {
                isReady: this.isReady.bind(this),
                storeLogs: this.storeLogs.bind(this)
            },
            {
                storeInterval: 1000,
                stringifyObjects: true
            }
        );

        Logger.addGlobalTransport(this._logCollector);
    }

    /**
     * Registers a callback which should receive logs from jitsi-meet-logger.
     *
     * @param {Function} handler - The callback which should receive logs.
     * @returns {void}
     */
    addHandler(handler) {
        this._handlers.add(handler);
    }

    /**
     * Updates the device ID which is used to identify this client instance by the logging service.
     *
     * @param {string} deviceId - The new device ID to be used.
     * @returns {void}
     */
    updateDeviceId(deviceId) {
        // Push all cached logs to the old endpoint which is device ID based (new logs will end up in different place).
        this._logCollector.flush();

        // Tries to update device Id if a handler supports it.
        for (const handler of this._handlers) {
            if (typeof handler.setDeviceId === 'function') {
                handler.setDeviceId(deviceId);
            }
        }
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
     * Removes a callback from known handlers so it no longer gets events.
     *
     * @param {Function} handler - The callback to be de-registered.
     * @returns {void}
     */
    removeHandler(handler) {
        this._handlers.delete(handler);
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
     * @param {Array<string>} logs - The log statements with meta data. The
     * jitsi-meet-logger stores the objects as strings.
     * @returns {void}
     */
    storeLogs(logs) {
        this._handlers.forEach(handler => handler.send(logs));
    }
}
