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
 * @param {string} messageKey - The translation key for the message to display.
 * @param {Object} messageParams - Additional variables to use within the
 * message.
 * @returns {Object}
 */
export function addNotification(type, messageKey, messageParams = {}) {
    return {
        type: NOTIFICATION_ADD,
        notification: {
            id: notificationId++,
            messageKey,
            messageParams,
            type
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
