import {
    SET_LONG_LIVED_PAIRING_CODE_INFO
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
