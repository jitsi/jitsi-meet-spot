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
