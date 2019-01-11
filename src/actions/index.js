import {
    CALENDAR_SET_ACCOUNT,
    CALENDAR_SET_EVENTS,
    NOTIFICATION_ADD,
    NOTIFICATION_REMOVE,
    REMOTE_CONTROL_SET_LOCAL_ID,
    REMOTE_CONTROL_SET_LOCK,
    SETUP_COMPLETED
} from 'reducers';

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

/**
 * Signals a calendar has been selected to be displayed in the application.
 *
 * @param {string} email - The email address of the calendar to be connected
 * with Spot.
 * @param {string} displayName - The name to associate the calendar.
 * @param {string} calendarType - Which calendar integration service the
 * calendar should be using.
 * @returns {Object}
 */
export function setCalendar(email, displayName, calendarType) {
    return {
        type: CALENDAR_SET_ACCOUNT,
        calendarType,
        displayName,
        email
    };
}

/**
 * Signals to replace the currently known calendar events.
 *
 * @param {Array<Object>} events - The calendar events to display.
 * @returns {Object}
 */
export function setCalendarEvents(events = []) {
    return {
        type: CALENDAR_SET_EVENTS,
        events
    };
}

/**
 * Signals to update the known client id that has been assigned by connecting
 * to the remote control service. The id is used to allow Spot instances and
 * remoteController instances identify each other for sending messages and
 * commands.
 *
 * @param {string} id - The id (jid) of the client that has connected to the
 * remote control service.
 * @returns {Object}
 */
export function setLocalRemoteControlID(id) {
    return {
        type: REMOTE_CONTROL_SET_LOCAL_ID,
        id
    };
}

/**
 * Updates the known lock code necessary to establish a remote control
 * connection.
 *
 * @param {string} lock - The latest lock code string.
 * @returns {Object}
 */
export function setLock(lock) {
    return {
        type: REMOTE_CONTROL_SET_LOCK,
        lock
    };
}

/**
 * Signals that the Spot setup flow has been successfully completed and should
 * no longer be displayed.
 *
 * @returns {Object}
 */
export function setSetupCompleted() {
    return {
        type: SETUP_COMPLETED
    };
}
