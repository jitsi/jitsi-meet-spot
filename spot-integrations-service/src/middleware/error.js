/**
 * Responds to a request with error details.
 *
 * @param {Object} error - The error which occurred that should be reported in
 * the response.
 * @param {Object} req - The Express object for the request.
 * @param {Object} res - The Express object for responding to a request.
 * @param {Function} next - A function to proceed to another middleware. The
 * existence of this argument is what marks it as Express error middleware.
 * @returns {void}
 */
function errorMiddleware(error, req, res, next) { // eslint-disable-line no-unused-vars
    const message = error.message || 'Something went wrong.';
    const status = error.status || 500;

    res.status(status).json({
        status,
        message
    });
}

module.exports = errorMiddleware;
