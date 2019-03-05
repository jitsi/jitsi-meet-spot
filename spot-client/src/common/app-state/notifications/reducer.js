import {
    NOTIFICATION_ADD,
    NOTIFICATION_REMOVE
} from './action-types';

const DEFAULT_STATE = {
    notifications: []
};

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

export default notifications;
