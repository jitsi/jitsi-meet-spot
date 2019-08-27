const { generateExpiresAndExpiresIn, generateRandomString } = require('../backend/utils');

const ACCESS_TOKEN_DURATION = 60 * 60 * 1000;
const SHORT_LIVED_TOKEN_DURATION = 60 * 60 * 1000;

const LONG_LIVED_PAIRING_CODE_DURATION = 60 * 60 * 1000;
const SHORT_LIVED_PAIRING_CODE_DURATION = 10 * 60 * 1000;

/**
 * FIXME add JWT
 * @typedef {Object} SpotOptions
 * @property {string} roomName
 * @property {string} joinCode
 */

/**
 *
 * @param struct
 * @returns {boolean}
 * @private
 */
function _expired(struct){
    return !struct || Date.now() >= struct.expires;
}

/**
 *
 */
class SpotRoom {
    /**
     *
     * @param {string} id - The Spot room ID.
     * @param {SpotOptions} options
     * @constructor
     */
    constructor(id, { countryCode, jwt, shortLivedJwt, name, tenant }) {
        this.id = id;
        this.generateLongLivedPairingCode('12345678');
        this.regenerateAccessToken(jwt);
        this.regenerateShortLivedAccessToken(shortLivedJwt);
        this.generateShortLivedPairingCode();
        this.countryCode = countryCode;
        this.mucUrl = id;
        this.name = name;
        this.tenant = tenant;
    }

    regenerateAccessToken(jwt) {
        const newRefreshToken
            = (this._accessToken && this._accessToken.refreshToken) || `refresh${generateRandomString()}`;

        this._accessToken = {
            accessToken: jwt || generateRandomString(),
            refreshToken: newRefreshToken,
            ...generateExpiresAndExpiresIn(ACCESS_TOKEN_DURATION)
        };

        console.info(`Generated new access token ${this}`);

        return this._accessToken;
    }

    regenerateShortLivedAccessToken(jwt) {
        this._shortLivedToken = {
            accessToken: jwt || generateRandomString(),
            ...generateExpiresAndExpiresIn(SHORT_LIVED_TOKEN_DURATION)
        };

        console.info(`Generated new short lived access token ${this}`);

        return this._shortLivedToken;
    }

    getAccessToken() {
        if (_expired(this._accessToken)) {
            this.regenerateAccessToken();
        }

        return this._accessToken;
    }

    getShortLivedAccessToken() {
        if (_expired(this._shortLivedToken)) {
            this.regenerateShortLivedAccessToken();
        }

        return this._shortLivedToken;
    }

    getLongLivedPairingCode() {
        if (_expired(this._pairingCode)) {
            this.generateLongLivedPairingCode();
        }

        return this._pairingCode;
    }

    getShortLivedPairingCode() {
        if (_expired(this._remotePairingCode)) {
            this.generateShortLivedPairingCode();
        }

        return this._remotePairingCode;
    }

    generateLongLivedPairingCode(pairingCode) {
        this._pairingCode = {
            code: pairingCode || generateRandomString(8),
            ...generateExpiresAndExpiresIn(LONG_LIVED_PAIRING_CODE_DURATION)
        };

        console.info(`Generated new long lived pairing code ${this}`);

        return this._pairingCode;
    }

    generateShortLivedPairingCode() {
        this._remotePairingCode = {
            code: generateRandomString(6),
            ...generateExpiresAndExpiresIn(SHORT_LIVED_PAIRING_CODE_DURATION)
        };

        console.info(`Generated new short lived pairing code ${this}`);

        return this._remotePairingCode;
    }

    toString() {
        return `SpotRoom[id: ${this.id},`
            + ` AT: ${this._accessToken && this._accessToken.accessToken}`
            + ` RT: ${this._accessToken && this._accessToken.refreshToken}`
            + ` LLPC: ${this._pairingCode && this._pairingCode.code}`
            + ` SLPC: ${this._remotePairingCode && this._remotePairingCode.code}`
            + ` SLAT: ${this._shortLivedToken && this._shortLivedToken.accessToken}]`;
    }
}

module.exports = SpotRoom;
