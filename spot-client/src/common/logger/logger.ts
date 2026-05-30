 

import Logger from '@jitsi/logger';

const jitsiLogger = Logger.getLogger(null, null, { disableCallerInfo: true });

/**
 * Helper to format how logs should be stored with meta data.
 *
 * @param level - The severity level of the log.
 * @param message - The message to be logged.
 * @param context - Additional information to be logged.
 * @returns The log object, which includes metadata, as a string.
 */
function formatMessage(_level: string, message: string, context?: string | Record<string, any>): string {
    let contextValue;

    if (context) {
        if (typeof context === 'string') {
            contextValue = context;
        } else {
            const contextCopy: Record<string, any> = { ...context };

            for (const key in contextCopy) {
                if (Object.hasOwn(contextCopy, key) && contextCopy[key] instanceof Error) {
                    const error = contextCopy[key];

                    contextCopy[key] = JSON.stringify(error, Object.getOwnPropertyNames(error));
                }
            }
            contextValue = JSON.stringify(contextCopy);
        }
    }

    if (contextValue) {
        return `${message} ${contextValue}`;
    }

    return message;
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
 * error: 5.
 */
export default {
    /**
     * Logs a debug level message.
     *
     * @param message - The main string to be logged as debug level msg.
     * @param context - Additional information to be logged.
     * @returns
     */
    debug(message: string, context?: string | Record<string, any>): void {
        jitsiLogger.debug(formatMessage('debug', message, context));
    },

    /**
     * Logs an error level message. Should be used for critical errors.
     *
     * @param message - The main string to be logged as an error.
     * @param context - Additional information to be logged.
     * @returns
     */
    error(message: string, context?: string | Record<string, any>): void {
        jitsiLogger.error(formatMessage('error', message, context));
    },

    /**
     * Logs an info level message. Less urgent than the log level, but more urgent that the debug level.
     *
     * @param message - The main string to be logged as essentially an
     * information level log.
     * @param context - Additional information to be logged.
     * @returns
     */
    info(message: string, context?: string | Record<string, any>): void {
        jitsiLogger.info(formatMessage('info', message, context));
    },

    /**
     * Logs a normal level message. Should be used for recording normal app
     * behavior.
     *
     * @param message - The main string to be logged as essentially an
     * information level log.
     * @param context - Additional information to be logged.
     * @returns
     */
    log(message: string, context?: string | Record<string, any>): void {
        jitsiLogger.log(formatMessage('log', message, context));
    },

    /**
     * Logs a trace level message. Should be used for debug messages with the biggest level of details.
     *
     * @param message - The main string to be logged as a trace.
     * @param context - Additional information to be logged.
     * @returns
     */
    trace(message: string, context?: string | Record<string, any>): void {
        jitsiLogger.trace(formatMessage('trace', message, context));
    },

    /**
     * Logs a warning message. Should be used for recoverable errors or to
     * indicate recovery from errors.
     *
     * @param message - The main string to be logged a warning.
     * @param context - Additional information to be logged.
     * @returns
     */
    warn(message: string, context?: string | Record<string, any>): void {
        jitsiLogger.warn(formatMessage('warn', message, context));
    }
};
