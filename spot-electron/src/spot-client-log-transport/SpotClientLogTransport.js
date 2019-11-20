const electronLog = require('electron-log');

const { clientController, events } = require('../client-control');

// Make the electron-log accept everything.
electronLog.transports.file.level = 'verbose';

// Configure electron-log to write to file only
electronLog.transports.console = undefined;
electronLog.transports.mainConsole = undefined;
electronLog.transports.rendererConsole = undefined;

// Uncomment this line to try out electron file logger in dev
// electronLog.transports.file.file = './spot-electron-dev.log';

const JITSI_TO_ELECTRON_LEVELS = {
    'error': 'error',
    'warn': 'warn',
    'info': 'info',
    'trace': 'verbose',
    'debug': 'debug',
    'log': 'log'
};

/**
 * Log levels supported by the jitsi logger.
 */
const levels = Object.keys(require('jitsi-meet-logger').levels).map(l => l.toLowerCase());

const LOG_CACHE_SIZE = 1000;

/**
 * A class.
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

        this._logToElectronLog(level, loggerName, message, context);

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

    /**
     * Forwards the log message to the 'electron-log' in order to write to the log file.
     *
     * @param {string} level - The jitsi logging level.
     * @param {string} loggerName - Logger name(as defined by jitsi-logger lib).
     * @param {string} message - The text message to be logged.
     * @param {Object} context - JSON compatible context object with extra info.
     * @private
     * @returns {void}
     */
    _logToElectronLog(level, loggerName, message, context) {
        const logMethod = electronLog[JITSI_TO_ELECTRON_LEVELS[level]];

        if (logMethod) {
            logMethod && logMethod(message, JSON.stringify(context));
        } else {
            // eslint-disable-next-line no-console
            console.error(`Failed to map jitsi to electron log level:${level}`);
        }
    }
}

module.exports = new SpotClientLogTransport();
