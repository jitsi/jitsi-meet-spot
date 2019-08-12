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
 * Returns whether or not new user onboarding has been completed.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function isOnboardingComplete(state) {
    return Boolean(state.spotRemote.completedOnboarding);
}
