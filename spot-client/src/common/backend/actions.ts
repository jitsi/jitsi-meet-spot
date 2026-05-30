import { SET_PERMANENT_PAIRING_CODE } from './actionTypes';

/**
 * Stores a permanent pairing code to be used by Spot TV and Spot Remotes which are to say connected to the backend
 * permanently.
 *
 * @param permanentPairingCode - The code.
 * @returns
 */
export function setPermanentPairingCode(permanentPairingCode: string): {
    type: string;
    permanentPairingCode: string;
} {
    return {
        type: SET_PERMANENT_PAIRING_CODE,
        permanentPairingCode
    };
}
