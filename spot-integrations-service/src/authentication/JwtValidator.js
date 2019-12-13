const fetch = require('fetch-retry');
const jsonwebtoken = require('jsonwebtoken');
const NodeCache = require('node-cache');
const sha256 = require('sha256');

/**
 * Encapsulates checking if a JWT is valid by checking against a fetched
 * verification key and by checking the JWT values.
 */
class JwtValidator {
    /**
     * Instantiates a new instance.
     *
     * @param {string} verificationKeyServer - The base URL from which to
     * get the verification key for validating the JWT.
     * @param {string} jwtOptions - Additional information to use when validating
     * the contents of the JWT.
     */
    constructor(verificationKeyServer, jwtOptions = {}) {
        if (!jwtOptions.audiences || !jwtOptions.issuers) {
            throw new Error('missing args for JwtValidator');
        }

        this._verificationKeyServer = verificationKeyServer;
        this._jwtOptions = {
            cacheTtl: 3600,
            shaFlag: true,
            ...jwtOptions
        };

        this._verificationKeyCache = new NodeCache();
    }


    /**
     * Retrieves a verification key that should be used to check against the
     * passed in JWT.
     *
     * @param {JWT} jwt - The complete JWT with a kid.
     * @returns {Promise} Resolves with the verification key.
     */
    async getVerificationKey(jwt) {
        if (!jwt || !jwt.header.kid) {
            throw new Error('no jwt');
        }

        const { kid } = jwt.header;

        if (this._verificationKeyCache.has(kid)) {
            return this._verificationKeyCache.get(kid);
        }

        const requestPath = this._jwtOptions.shaFlag
            ? `${sha256(kid)}.pem` : kid;

        const response = await fetch(`${this._verificationKeyServer}/${requestPath}`, {
            retries: 3,
            retryDelay: 2000
        });
        const responseText = await response.text();
        const cacheTtl = (response.headers.get('cache-control') || '')
            .split(',')
            .shift()
            .split('=')
            .pop();

        this._verificationKeyCache.set(
            kid,
            responseText,
            cacheTtl || this._jwtOptions.cacheTtl
        );

        return responseText;
    }

    /**
     * Checks if a JWT passes validation checks so it should be trusted.
     *
     * @param {string} encodedJwt - The JWT to check, encoded.
     * @returns {Promise} Resolve if the JWT is valid. Rejects with an error
     * object if the JWT is invalid.
     */
    async isValidJwt(encodedJwt) {
        const decodedJwt = jsonwebtoken.decode(encodedJwt, { complete: true });
        const verificationKey = await this.getVerificationKey(decodedJwt);
        const verifiedJwt = jsonwebtoken.verify(encodedJwt, verificationKey);
        const validationError = this.getJwtValidationError(verifiedJwt);

        if (validationError) {
            throw new Error(validationError);
        }
    }

    /**
     * Checks if the details of a JWT payload are the expected values.
     *
     * @param {Object} payload - The payload attribute of a JWT.
     * @returns {string} An error message about how the JWT is invalid.
     */
    getJwtValidationError(payload) {
        if (!payload) {
            return 'no valid jwt';
        }

        const { aud, iss } = payload;

        if (!iss) {
            return 'no issuer';
        }

        const issArray = Array.isArray(iss)
            ? iss
            : iss.split(',');

        if (!this._jwtOptions.issuers.some(issuer => issArray.includes(issuer))) {
            return 'invalid issuer';
        }

        if (!aud) {
            return 'no audience';
        }

        const audArray = Array.isArray(aud)
            ? aud
            : aud.split(',');

        if (!this._jwtOptions.audiences.some(audience => audArray.includes(audience))) {
            return 'invalid audience';
        }

        return;
    }
}

module.exports = JwtValidator;
