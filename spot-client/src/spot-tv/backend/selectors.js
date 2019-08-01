/**
 * Returns the long lived pairing code to be used by Spot TV and Spot Remotes
 * which stay connected to the service for long periods of time.
 *
 * @param {Object} state - The Redux state.
 * @returns {Object}
 */
export function getLongLivedPairingCodeInfo(state) {
    return state['spot-tv/backend'].longLivedPairingCodeInfo;
}

/**
 * Returns the permanent pairing code to be used by Spot TV and Spot Remotes which stay connected to the service for
 * long periods of time.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getPermanentPairingCode(state) {
    return state['spot-tv/backend'].permanentPairingCode;
}
