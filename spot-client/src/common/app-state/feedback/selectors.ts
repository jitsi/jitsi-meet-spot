import type { RootState } from '../types';

/**
 * Returns whether or not the app feedback entry should be visible.
 *
 * @param state - The Redux state.
 * @returns {boolean}
 */
export function isAppFeedbackShown(state: RootState): boolean {
    return state.feedback.show;
}
