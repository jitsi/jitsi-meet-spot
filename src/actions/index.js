import {
    CALENDAR_SET_ACCOUNT,
    CALENDAR_SET_EVENTS,
    NOTIFICATION_ADD,
    NOTIFICATION_REMOVE,
    REMOTE_CONTROL_SET_LOCK,
    REMOTE_CONTROL_SET_MEETING,
    REMOTE_CONTROL_SET_SPOT_STATE,
    REMOTE_CONTROL_SPOT_LEFT,
    SETUP_COMPLETED,
    SETUP_SET_SCREENSHARE_DEVICE
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
 * Signals to store the preferred video input source for screensharing with
 * a physical connector.
 *
 * @param {string} label - The label value set to the video input device as
 * listed by Webrtc (enumerateDevices).
 * @returns {Object}
 */
export function setScreenshareDevice(label) {
    return {
        type: SETUP_SET_SCREENSHARE_DEVICE,
        label
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
 * Sets a reference to the in-progress meeting so it can be used elsewhere.
 *
 * @param {Object} meetingApi - An instance of {@code JitsiMeetExternalAPI}.
 * @returns {Object}
 */
export function setMeetingApi(meetingApi) {
    return {
        type: REMOTE_CONTROL_SET_MEETING,
        meetingApi
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

/**
 * Signals a Spot has become no longer available to control.
 *
 * @returns {Object}
 */
export function setSpotLeft() {
    return {
        type: REMOTE_CONTROL_SPOT_LEFT
    };
}

/**
 * Signals Spot has changed some part of its status that should be known to
 * remote controls.
 *
 * @param {Object} state - The new state that should be mixed in with the stored
 * state.
 * @returns {Object}
 */
export function updateSpotState(state) {
    return {
        type: REMOTE_CONTROL_SET_SPOT_STATE,
        state
    };
}
