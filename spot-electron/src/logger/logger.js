/**
 * Implements a singleton logger.
 */
class Logger {

    /**
     * Logs a message on ERROR level.
     *
     * @param {string} message - The log message.
     * @param {?Error} throwable - The error to be logged, if any.
     * @returns {void}
     */
    error(message, throwable) {
        this._log('ERROR', message, throwable);
    }

    /**
     * Logs a message on INFO level.
     *
     * @param {string} message - The log message.
     * @returns {void}
     */
    info(message) {
        this._log('INFO', message);
    }

    /**
     * Logs a message on WARNING level.
     *
     * @param {string} message - The log message.
     * @param {?Error} throwable - The error to be logged, if any.
     * @returns {void}
     */
    warning(message, throwable) {
        this._log('WARNING', message, throwable);
    }

    /**
     * Private function to log a message.
     *
     * @private
     * @param {string} level - The log level.
     * @param {string} message - The log message.
     * @param {?Error} throwable - The error to be logged, if any.
     * @returns {void}
     */
    _log(level, message, throwable) {
        // eslint-disable-next-line no-console
        console.log(`${new Date().toISOString()} - ${level} - ${message}${throwable ? ` - ${throwable}` : ''}`);
    }
}

exports.logger = new Logger();
