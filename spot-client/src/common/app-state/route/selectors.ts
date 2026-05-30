/**
 * Returns the current route.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getCurrentRoute(state: any): string | undefined {
    return state.route.location?.pathname;
}
