import { getLogger } from '@jitsi/logger';

const jitsiLogger = getLogger('spot-electron', undefined, {
    disableCallerInfo: true
});

/**
 * The shape of the shared logger.
 *
 * Log level priorities (the higher the number the more urgent the level is):
 * trace: 0, debug: 1, info: 2, log: 3, warn: 4, error: 5.
 */
export interface Logger {
    debug(message: string, context?: unknown): void;
    error(message: string, context?: unknown): void;
    info(message: string, context?: unknown): void;
    log(message: string, context?: unknown): void;
    trace(message: string, context?: unknown): void;
    warn(message: string, context?: unknown): void;
}

/**
 * A logger to use for logging, to prevent direct access to console and add
 * additional behavior as needed.
 */
const logger: Logger = {
    /**
     * Logs a debug level message.
     *
     * @param message - The main string to be logged as debug level msg.
     * @param context - Additional information to be logged.
     * @returns {void}
     */
    debug(message, context) {
        jitsiLogger.debug(message, context);
    },

    /**
     * Logs an error level message. Should be used for critical errors.
     *
     * @param message - The main string to be logged as an error.
     * @param context - Additional information to be logged.
     * @returns {void}
     */
    error(message, context) {
        jitsiLogger.error(message, context);
    },

    /**
     * Logs an info level message. Less urgent than the log level, but more urgent that the debug level.
     *
     * @param message - The main string to be logged as essentially an information level log.
     * @param context - Additional information to be logged.
     * @returns {void}
     */
    info(message, context) {
        jitsiLogger.info(message, context);
    },

    /**
     * Logs a normal level message. Should be used for recording normal app behavior.
     *
     * @param message - The main string to be logged as essentially an information level log.
     * @param context - Additional information to be logged.
     * @returns {void}
     */
    log(message, context) {
        jitsiLogger.log(message, context);
    },

    /**
     * Logs a trace level message. Should be used for debug messages with the biggest level of details.
     *
     * @param message - The main string to be logged as a trace.
     * @param context - Additional information to be logged.
     * @returns {void}
     */
    trace(message, context) {
        jitsiLogger.trace(message, context);
    },

    /**
     * Logs a warning message. Should be used for recoverable errors or to indicate recovery from errors.
     *
     * @param message - The main string to be logged a warning.
     * @param context - Additional information to be logged.
     * @returns {void}
     */
    warn(message, context) {
        jitsiLogger.warn(message, context);
    }
};

export default logger;
