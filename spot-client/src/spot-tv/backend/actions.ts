import {
    SET_LONG_LIVED_PAIRING_CODE_INFO
} from './actionTypes';

/**
 * Stores information about the long live pairing code to use for connecting
 * a Spot-Remote to the Spot-TV.
 *
 * @param longLivedPairingCodeInfo - An object containing the pairing
 * code as well as expiry information.
 * @returns
 */
export function setLongLivedPairingCodeInfo(longLivedPairingCodeInfo: any): any {
    return {
        type: SET_LONG_LIVED_PAIRING_CODE_INFO,
        longLivedPairingCodeInfo
    };
}
