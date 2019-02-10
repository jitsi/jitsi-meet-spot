const DEFAULT_STATE = {
    notifications: []
};

export const NOTIFICATION_ADD = 'NOTIFICATION_ADD';
export const NOTIFICATION_REMOVE = 'NOTIFICATION_REMOVE';

/**
 * A {@code Reducer} to update the current Redux state for the 'notifications'
 * feature. The 'notifications' feature stores app event message to display
 * across different views.
 *
 * @param {Object} state - The current Redux state for the 'setup' feature.
 * @param {Object} action - The Redux state update payload.
 * @returns {Object} The new redux state for the feature 'notifications'.
 */
const notifications = (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case NOTIFICATION_ADD:
        return {
            ...state,
            notifications: [ ...state.notifications, action.notification ]
        };

    case NOTIFICATION_REMOVE:
        return {
            ...state,
            notifications: state.notifications.filter(notification =>
                notification.id !== action.id)
        };

    default:
        return state;
    }
};

/**
 * A selector which returns all notifications that should be displayed.
 *
 * @param {Object} state - The Redux state.
 * @returns {Array<Object>}
 */
export function getAllNotifications(state) {
    return state.notifications.notifications;
}

export default notifications;
