import type { RootState } from '../types';

/**
 * Returns the current route.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getCurrentRoute(state: RootState): string | undefined {
    return state.route.location?.pathname;
}
