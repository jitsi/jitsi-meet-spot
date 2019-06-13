/**
 * Returns whether or not new user onboarding has been completed.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function isOnboardingComplete(state) {
    return Boolean(state.spotRemote.completedOnboarding);
}
