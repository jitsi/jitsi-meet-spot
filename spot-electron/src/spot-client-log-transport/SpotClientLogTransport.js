const { clientController, events } = require('../client-control');


/**
 * Log levels supported by the jitsi logger.
 */
const levels = Object.keys(require('jitsi-meet-logger').levels).map(l => l.toLowerCase());

const LOG_CACHE_SIZE = 1000;

/**
 * SpotClientLogTransport - used to send electron logs to renderer process in order to be displayed in web console.
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
                        message,
                        context
                    } = delayedLog;

                    clientController.sendClientMessage('spot-electron-logs', level, message, context);
                }
                this._logsCache = [];
            }
        });
    }

    /**
     * The log message executed for every logging level.
     *
     * @param {string} level - The logging level as defined by the jitsi-logger lib.
     * @param {string} loggerName - The logger name automatically added as argument by the jitsi-logger.
     * @param {string} message - A message passed to the corresponding log level method.
     * @param {Object} context - Optional additional information as a JSON compatible object.
     * @returns {void}
     */
    _logImpl(level, loggerName, message, context) {
        const msgString = `${loggerName} ${message}`;

        // send logs to renderer process once it has finished to load.
        if (clientController.canSendClientMessage()) {
            clientController.sendClientMessage('spot-electron-logs', level, msgString, context);
        } else {
            if (this._logsCache.length >= LOG_CACHE_SIZE) {
                this._logsCache.shift();
            }

            this._logsCache.push({
                level,
                message: msgString,
                context
            });
        }
    }
}

module.exports = new SpotClientLogTransport();
