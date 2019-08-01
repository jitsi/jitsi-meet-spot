import {
    SET_LONG_LIVED_PAIRING_CODE_INFO,
    SET_PERMANENT_PAIRING_CODE
} from './actionTypes';

/**
 * Stores information about the long live pairing code to use for connecting
 * a Spot-Remote to the Spot-TV.
 *
 * @param {Object} longLivedPairingCodeInfo - An object containing the pairing
 * code as well as expiry information.
 * @returns {Object}
 */
export function setLongLivedPairingCodeInfo(longLivedPairingCodeInfo) {
    return {
        type: SET_LONG_LIVED_PAIRING_CODE_INFO,
        longLivedPairingCodeInfo
    };
}

/**
 * Stores a permanent pairing code to be used by Spot TV and Spot Remotes which are to say connected to the backend
 * permanently.
 *
 * @param {string} permanentPairingCode - The code.
 * @returns {{
 *     type: SET_PERMANENT_PAIRING_CODE,
 *     permanentPairingCode: string
 * }}
 */
export function setPermanentPairingCode(permanentPairingCode) {
    return {
        type: SET_PERMANENT_PAIRING_CODE,
        permanentPairingCode
    };
}
