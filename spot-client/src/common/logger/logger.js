/* eslint-disable no-console */

import { getLogger } from 'jitsi-meet-logger';

const jitsiLogger = getLogger(null, null, { disableCallerInfo: true });

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
        formattedMessage.context = context;
    }

    return formattedMessage;
}

/**
 * A logger to use for logging, to prevent direct access to console and add
 * additional behavior as needed.
 */
export default {
    /**
     * Logs an error level message. Should be used for critical errors.
     *
     * @param {string} message - The main string to be logged as an error.
     * @param {Object} context - Additional information to be logged.
     * @returns {void}
     */
    error(message, context) {
        jitsiLogger.error(formatMessage('error', message, context));
    },

    /**
     * Logs a normal level message. Should be used for recording normal app
     * behavior.
     *
     * @param {string} message - The main string to be logged as essentially an
     * information level log.
     * @param {Object} context - Additional information to be logged.
     * @returns {void}
     */
    log(message, context) {
        jitsiLogger.log(formatMessage('log', message, context));
    },

    /**
     * Logs a warning message. Should be used for recoverable errors or to
     * indicate recovery from errors.
     *
     * @param {string} message - The main string to be logged a warning.
     * @param {Object} context - Additional information to be logged.
     * @returns {void}
     */
    warn(message, context) {
        jitsiLogger.warn(formatMessage('warn', message, context));
    }
};
