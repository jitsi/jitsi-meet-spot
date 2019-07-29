import { CANCEL_LOCAL_NOTIFICATION, NOTIFICATION_RECEIVED, SEND_LOCAL_NOTIFICATION } from './actionTypes';

/**
 * Action to cancel a local notification.
 *
 * @param {string} id - The ID of the notification.
 * @returns {{
 *     id: string,
 *     type: CANCEL_LOCAL_NOTIFICATION
 * }}
 */
export function cancelLocalNotification(id) {
    return {
        id,
        type: CANCEL_LOCAL_NOTIFICATION
    };
}

/**
 * Action to notify the features that a notification was received.
 *
 * @param {string} id - The ID of the notification.
 * @returns {{
 *     id: string,
 *     type: NOTIFICATION_RECEIVED
 * }}
 */
export function notificationReceived(id) {
    return {
        id,
        type: NOTIFICATION_RECEIVED
    };
}

/**
 * Action to send a local push notification.
 *
 * @param {string} id - The ID of the notification.
 * @param {string} title - The notification title.
 * @param {string} text - The notification text (content).
 * @returns {{
 *     id: string,
 *     text: string,
 *     title: string,
 *     type: SEND_LOCAL_NOTIFICATION
 * }}
 */
export function sendLocalNotification(id, title, text) {
    return {
        id,
        text,
        title,
        type: SEND_LOCAL_NOTIFICATION
    };
}
