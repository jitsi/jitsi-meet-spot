import {
    PAIRED_REMOTE_ADD,
    PAIRED_REMOTE_CLEAR,
    PAIRED_REMOTE_REMOVE
} from './actionTypes';

/**
 * Adds reference to a Spot-Remote connected to the Spot-TV.
 *
 * @param {string} id - The unique identifier for the Spot-Remote.
 * @param {string} remoteType - The type of the remote, permanent or temporary.
 * @returns {Object}
 */
export function addPairedRemote(id, remoteType) {
    return {
        type: PAIRED_REMOTE_ADD,
        id,
        remoteType
    };
}

/**
 * Removes reference to a Spot-Remote connected to the Spot-TV.
 *
 * @param {string} id - The unique identifier for the Spot-Remote.
 * @returns {Object}
 */
export function removePairedRemote(id) {
    return {
        type: PAIRED_REMOTE_REMOVE,
        id
    };
}

/**
 * Removes all references to Spot-Remotes connected to the Spot-TV.
 *
 * @returns {Object}
 */
export function clearAllPairedRemotes() {
    return {
        type: PAIRED_REMOTE_CLEAR
    };
}
