const { clientController, events } = require('../client-control');

/**
 * Log levels supported by the jitsi logger.
 */
const levels = [ 'trace', 'debug', 'info', 'log', 'warn', 'error' ];

const LOG_CACHE_SIZE = 1000;

/**
 * A class
 */
class SpotClientLogTransport {
    /**
     * Creates a new instance of {@code LoggingService} and registers itself
     * to receive logs.
     */
    constructor() {
        for (const level of levels) {
            this[level] = this.log.bind(this);
        }

        this._logsCache = [];

        clientController.on(events.CAN_SEND_MSG_EVENT, canSendMsgs => {
            if (canSendMsgs) {
                for (const delayedLog of this._logsCache) {
                    clientController.sendClientMessage('spot-electron-logs', delayedLog);
                }
                this._logsCache = [];
            }
        });
    }

    /**
     * The log message executed for every logging level.
     *
     * @param {...*} args - Log method arguments as defined by jitsi-logger.
     * @returns {void}
     */
    log(...args) {
        const logString = args.join(' ');

        if (clientController.canSendClientMessage()) {
            clientController.sendClientMessage('spot-electron-logs', logString);
        } else {
            if (this._logsCache.length >= LOG_CACHE_SIZE) {
                this._logsCache.shift();
            }

            this._logsCache.push(logString);
        }
    }
}

module.exports = new SpotClientLogTransport();
