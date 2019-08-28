/**
 * Returns whether or not the app feedback entry should be visible.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isAppFeedbackShown(state) {
    return state.feedback.show;
}
