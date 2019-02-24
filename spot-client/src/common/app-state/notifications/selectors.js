
/**
 * A selector which returns all notifications that should be displayed.
 *
 * @param {Object} state - The Redux state.
 * @returns {Array<Object>}
 */
export function getAllNotifications(state) {
    return state.notifications.notifications;
}
