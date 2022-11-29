const jitsiLogger = require('jitsi-meet-logger').getLogger('spot-electron', undefined, {
    disableCallerInfo: true
});
const { logToFile } = require('./loggerFile');

/**
 * A logger to use for logging, to prevent direct access to console and add
 * additional behavior as needed.
 *
 * Log level priorities(the higher the number the more urgent the level is):
 * trace: 0
 * debug: 1
 * info: 2
 * log: 3
 * warn: 4
 * error: 5
 * .
 */
module.exports = {
    /**
     * Logs a debug level message.
     *
     * @param {string} message - The main string to be logged as debug level msg.
     * @param {Object} [context] - Additional information to be logged.
     * @param {boolean} toFile - Logs message to file or not.
     * @returns {void}
     */
    debug(message, context, toFile = true) {
        jitsiLogger.debug(message, context);

        if (toFile) {
            logToFile('spot-electron', 'debug', message, context);
        }
    },

    /**
     * Logs an error level message. Should be used for critical errors.
     *
     * @param {string} message - The main string to be logged as an error.
     * @param {Object} [context] - Additional information to be logged.
     * @param {boolean} toFile - Logs message to file or not.
     * @returns {void}
     */
    error(message, context, toFile = true) {
        jitsiLogger.error(message, context);

        if (toFile) {
            logToFile('spot-electron', 'error', message, context);
        }

    },

    /**
     * Logs an info level message. Less urgent than the log level, but more urgent that the debug level.
     *
     * @param {string} message - The main string to be logged as essentially an
     * information level log.
     * @param {Object} [context] - Additional information to be logged.
     * @param {boolean} toFile - Logs message to file or not.
     * @returns {void}
     */
    info(message, context, toFile = true) {
        jitsiLogger.info(message, context);

        if (toFile) {
            logToFile('spot-electron', 'info', message, context);
        }
    },

    /**
     * Logs a normal level message. Should be used for recording normal app
     * behavior.
     *
     * @param {string} message - The main string to be logged as essentially an
     * information level log.
     * @param {Object} [context] - Additional information to be logged.
     * @param {boolean} toFile - Logs message to file or not.
     * @returns {void}
     */
    log(message, context, toFile = true) {
        jitsiLogger.log(message, context);

        if (toFile) {
            logToFile('spot-electron', 'log', message, context);
        }
    },

    /**
     * Logs a trace level message. Should be used for debug messages with the biggest level of details.
     *
     * @param {string} message - The main string to be logged as a trace.
     * @param {Object} [context] - Additional information to be logged.
     * @param {boolean} toFile - Logs message to file or not.
     * @returns {void}
     */
    trace(message, context, toFile = true) {
        jitsiLogger.trace(message, context);

        if (toFile) {
            logToFile('spot-electron', 'trace', message, context);
        }
    },

    /**
     * Logs a warning message. Should be used for recoverable errors or to
     * indicate recovery from errors.
     *
     * @param {string} message - The main string to be logged a warning.
     * @param {Object} [context] - Additional information to be logged.
     * @param {boolean} toFile - Logs message to file or not.
     * @returns {void}
     */
    warn(message, context, toFile = true) {
        jitsiLogger.warn(message, context);

        if (toFile) {
            logToFile('spot-electron', 'warn', message, context);
        }
    },

    /**
     * Logs a message to file.
     *
     * @param {string} loggerName - The logger name prefix for a message.
     * @param {string} level - The log level type.
     * @param {string} message - The main string to be logged a warning.
     * @param {Object} [context] - Additional information to be logged.
     * @param {boolean} toFile - Logs message to file or not.
     * @returns {void}
     */
    logToFile
};
