/* eslint-disable no-console */

import { getLogger } from 'jitsi-meet-logger';

const LOG_CONTEXT = 'spot-client';
const jitsiLogger = getLogger(LOG_CONTEXT, null, { disableCallerInfo: true });

/**
 * Helper to format how logs should be stored with meta data.
 *
 * @param {string} level - The severity level of the log.
 * @param {string} message - The message to be logged.
 * @param {Object} context - Additional information to be logged.
 * @returns {string} The log object, which includes metadata, as a string.
 */
function formatMessage(level, message, context) {
    const formattedMessage = {
        level,
        timestamp: Date.now(),
        message
    };

    if (context) {
        const contextCopy = { ...context };

        for (const key in contextCopy) {
            if (contextCopy.hasOwnProperty(key)
                && contextCopy[key] instanceof Error) {
                const error = contextCopy[key];

                contextCopy[key] = JSON.stringify(
                    error,
                    Object.getOwnPropertyNames(error)
                );
            }
        }

        formattedMessage.context = contextCopy;
    }

    return formattedMessage;
}

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
 */
export default {
    /**
     * Logs a debug level message.
     *
     * @param {string} message - The main string to be logged as debug level msg.
     * @param {Object} [context] - Additional information to be logged.
     * @param {boolean} toFile - Logs message to file or not.
     * @returns {void}
     */
    debug(message, context, toFile = true) {
        jitsiLogger.debug(formatMessage('debug', message, context));

        if (toFile && window.api && typeof window.api.logToFile === 'function') {
            window.api.logToFile(LOG_CONTEXT, 'debug', message, context);
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
    error(message, context = '', toFile = true) {
        jitsiLogger.error(formatMessage('error', message, context));

        if (toFile && window.api && typeof window.api.logToFile === 'function') {
            window.api.logToFile(LOG_CONTEXT, 'error', message, context);
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
        jitsiLogger.info(formatMessage('info', message, context));

        if (toFile && window.api && typeof window.api.logToFile === 'function') {
            window.api.logToFile(LOG_CONTEXT, 'info', message, context);
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
        jitsiLogger.log(formatMessage('log', message, context));

        if (toFile && window.api && typeof window.api.logToFile === 'function') {
            window.api.logToFile(LOG_CONTEXT, 'log', message, context);
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
        jitsiLogger.trace(formatMessage('trace', message, context));

        if (toFile && window.api && typeof window.api.logToFile === 'function') {
            window.api.logToFile(LOG_CONTEXT, 'trace', message, context);
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
        jitsiLogger.warn(formatMessage('warn', message, context));

        if (toFile && window.api && typeof window.api.logToFile === 'function') {
            window.api.logToFile(LOG_CONTEXT, 'warn', message, context);
        }
    }
};
