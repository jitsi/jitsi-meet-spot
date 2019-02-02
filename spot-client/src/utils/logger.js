/* eslint-disable no-console */

/**
 * A logger to use for logging, to prevent direct access to console and add
 * additional behavior as needed.
 */
export default {
    /**
     * Logs an error level message.
     *
     * @param {...any} args - The information to be logged as an error.
     * @returns {void}
     */
    error(...args) {
        console.error(...args);
    },

    /**
     * Logs a normal level message.
     *
     * @param {...any} args - The information to be logged.
     * @returns {void}
     */
    log(...args) {
        console.log(...args);
    }
};
