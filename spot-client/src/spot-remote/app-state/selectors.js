/**
 * A selector which returns the last received join code from the external API.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getApiReceivedJoinCode(state) {
    return state.spotRemote.apiReceivedJoinCode;
}

/**
 * Returns the permanent pairing code if any is currently stored.
 *
 * @param {Object} state - The current Redux state.
 * @returns {string|undefined}
 */
export function getPermanentPairingCode(state) {
    return state.spotRemote.permanentPairingCode;
}

/**
 * Returns whether or not new user onboarding has been completed.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function isOnboardingComplete(state) {
    return Boolean(state.spotRemote.completedOnboarding);
}
