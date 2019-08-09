import { CLIENT_TYPES } from 'common/remote-control';

/**
 * Returns the total number of Spot-Remotes connected to the Spot-TV.
 *
 * @param {Object} state - The Redux state.
 * @returns {number}
 */
export function getPairedRemotesCount(state) {
    return Object.keys(state.pairedRemotes.remotes).length;
}

/**
 * Returns the number of permanent Spot-Remotes connected to the Spot-TV.
 *
 * @param {Object} state - The Redux state.
 * @returns {number}
 */
export function getPermanentPairedRemotesCount(state) {
    const knownRemotes = state.pairedRemotes.remotes;

    return Object.keys(knownRemotes)
        .filter(remoteId => knownRemotes[remoteId].type === CLIENT_TYPES.SPOT_REMOTE_PERMANENT)
        .length;
}
