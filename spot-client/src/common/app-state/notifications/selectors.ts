
import type { RootState } from '../types';

/**
 * A selector which returns all notifications that should be displayed.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getAllNotifications(state: RootState): any[] {
    return state.notifications.notifications;
}
