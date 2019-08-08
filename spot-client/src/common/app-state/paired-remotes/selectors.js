/**
 * Returns the number of permanent Spot-Remotes connected to the Spot-TV.
 *
 * @param {Object} state - The Redux state.
 * @returns {number}
 */
export function getPermanentRemotesCount(state) {
    const knownRemotes = state.pairedRemotes.remotes;

    return Object.keys(knownRemotes)
        .filter(remoteId => knownRemotes[remoteId].type === 'permanent-remote')
        .length;
}
