/**
 * Provides a common format for error response handling to parse.
 */
class HttpException extends Error {
    /**
     * Instantiate a new instance.
     *
     * @param {number} status - The HTTP status code.
     * @param {string} message - Information about what caused the status code.
     */
    constructor(status = 500, message = 'Something went wrong') {
        super(message);

        this.status = status;
        this.message = message;
    }
}

module.exports = HttpException;
