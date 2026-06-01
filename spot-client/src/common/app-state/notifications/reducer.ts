import {
    NOTIFICATION_ADD,
    NOTIFICATION_REMOVE
} from './action-types';

interface INotification {
    id?: string;
    [key: string]: any;
}

export interface INotificationsState {
    notifications: INotification[];
}

const DEFAULT_STATE: INotificationsState = {
    notifications: []
};

/**
 * A {@code Reducer} to update the current Redux state for the 'notifications'
 * feature. The 'notifications' feature stores app event message to display
 * across different views.
 *
 * @param state - The current Redux state for the 'setup' feature.
 * @param action - The Redux state update payload.
 * @returns The new redux state for the feature 'notifications'.
 */
const notifications = (state: INotificationsState = DEFAULT_STATE, action: any): INotificationsState => {
    switch (action.type) {
    case NOTIFICATION_ADD:
        return {
            ...state,
            notifications: [ ...state.notifications, action.notification ]
        };

    case NOTIFICATION_REMOVE:
        return {
            ...state,
            notifications: state.notifications.filter((notification: INotification) =>
                notification.id !== action.id)
        };

    default:
        return state;
    }
};

export default notifications;
