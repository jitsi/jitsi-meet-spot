const HttpException = require('../exceptions/HttpException');

/**
 * Creates a function that will check if an express request includes a valid JWT
 * in the header.
 *
 * @param {JwtValidator} jwtValidator - An instance of a JwtValidator that will
 * check if the JWT can be trusted and is valid.
 * @returns {Function} The middleware function that should run to process
 * requests.
 */
module.exports = function initializeJwtAuthenticationMiddleware(jwtValidator) {
    return async function jwtAuthenticationMiddleware(req, res, next) {
        const authorization = req.header('Authorization');

        if (!authorization) {
            next(new HttpException(401, 'no authorization specified'));

            return;
        }

        const token = authorization.split(' ')[1];

        if (!token) {
            next(new HttpException(401, 'improper authorization format'));

            return;
        }

        try {
            await jwtValidator.isValidJwt(token);
        } catch (e) {
            next(new HttpException(401, e.message));

            return;
        }

        next();
    };
};
