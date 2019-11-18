/**
 * Returns the current route.
 *
 * @param {Object} state - The Redux state.
 * @returns {string|undefined}
 */
export function getCurrentRoute(state) {
    return state.route.location?.pathname;
}
