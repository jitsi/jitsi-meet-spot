import {
    NOTIFICATION_ADD,
    NOTIFICATION_REMOVE
} from './action-types';

let notificationId = 0;

/**
 * Queues a notification message to be displayed.
 *
 * @param type - One of the notification types, as defined by the
 * notifications feature.
 * @param messageKey - The translation key for the message to display.
 * @param messageParams - Additional variables to use within the
 * message.
 * @returns
 */
export function addNotification(
        type: string,
        messageKey: string,
        messageParams: Record<string, any> = {}): any {
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
* @param id - The id of the notification which should be removed.
* @returns
*/
export function removeNotification(id: number): any {
    return {
        type: NOTIFICATION_REMOVE,
        id
    };
}
