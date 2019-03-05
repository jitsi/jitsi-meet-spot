import {
    NOTIFICATION_ADD,
    NOTIFICATION_REMOVE
} from './action-types';

let notificationId = 0;

/**
 * Queues a notification message to be displayed.
 *
 * @param {string} type - One of the notification types, as defined by the
 * notifications feature.
 * @param {string} message - The text to display within the notification.
 * @returns {Object}
 */
export function addNotification(type, message) {
    return {
        type: NOTIFICATION_ADD,
        notification: {
            id: notificationId++,
            type,
            message
        }
    };
}

/**
* Dequeues a notification message from displaying.
*
* @param {string} id - The id of the notification which should be removed.
* @returns {Object}
*/
export function removeNotification(id) {
    return {
        type: NOTIFICATION_REMOVE,
        id
    };
}
