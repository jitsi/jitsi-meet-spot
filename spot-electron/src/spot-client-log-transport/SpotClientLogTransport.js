const { clientController, events } = require('../client-control');

/**
 * Log levels supported by the jitsi logger.
 */
const levels = Object.keys(require('jitsi-meet-logger').levels).map(l => l.toLowerCase());

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
            this[level] = this._logImpl.bind(this, level);
        }

        this._logsCache = [];

        clientController.on(events.CAN_SEND_MSG_EVENT, canSendMsgs => {
            if (canSendMsgs) {
                for (const delayedLog of this._logsCache) {
                    const {
                        level,
                        message
                    } = delayedLog;

                    clientController.sendClientMessage('spot-electron-logs', level, message);
                }
                this._logsCache = [];
            }
        });
    }

    /**
     * The log message executed for every logging level.
     *
     * @param {string} level - The logging level as defined by the jitsi-logger lib.
     * @param {...*} args - Whatever has been passed to the corresponding log level method.
     * @returns {void}
     */
    _logImpl(level, ...args) {
        const message = args.join(' ');

        if (clientController.canSendClientMessage()) {
            clientController.sendClientMessage('spot-electron-logs', level, message);
        } else {
            if (this._logsCache.length >= LOG_CACHE_SIZE) {
                this._logsCache.shift();
            }

            this._logsCache.push({
                level,
                message
            });
        }
    }
}

module.exports = new SpotClientLogTransport();
