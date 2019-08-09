import { SET_PERMANENT_PAIRING_CODE } from './actionTypes';

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
