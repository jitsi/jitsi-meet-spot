import {
    CALENDAR_SET_ACCOUNT,
    CALENDAR_SET_EVENTS,
    NOTIFICATION_ADD,
    NOTIFICATION_REMOVE,
    REMOTE_CONTROL_SET_JOIN_CODE,
    REMOTE_CONTROL_SET_LOCK,
    REMOTE_CONTROL_SET_MEETING,
    REMOTE_CONTROL_SET_ROOM_NAME,
    REMOTE_CONTROL_SET_SPOT_STATE,
    REMOTE_CONTROL_SPOT_LEFT,
    SETUP_COMPLETED,
    SET_IS_SPOT,
    SET_SHOW_MEETING_TOOLBAR
} from './../reducers';

let notificationId = 0;

export * from './wired-screenshare';

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
 * Updates the setting for whether or not the Jitsi-Meeting should show a
 * toolbar. The toolbar may be useful to show for debugging the meeting.
 *
 * @param {boolean} visible - Whether or not the toolbar should be displayed.
 * @returns {Object}
 */
export function setMeetingToolbarVisible(visible) {
    return {
        type: SET_SHOW_MEETING_TOOLBAR,
        visible
    };
}

/**
 * Sets whether or not the current client is acting as a Spot.
 *
 * @param {boolean} isSpot - Whether or not the current client is a Spot
 * instance.
 * @returns {Object}
 */
export function setIsSpot(isSpot) {
    return {
        type: SET_IS_SPOT,
        isSpot
    };
}

/**
 * Updates the known join code for connecting a remote to a Spot.
 *
 * @param {string} joinCode - The string necessary for a remote control to
 * connect to a spot.
 * @returns {Object}
 */
export function setJoinCode(joinCode) {
    return {
        type: REMOTE_CONTROL_SET_JOIN_CODE,
        joinCode
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
 * Updates the known muc room name being joined in order to communicate between
 * remote and a Spot instance.
 *
 * @param {string} roomName - The latest room name.
 * @returns {Object}
 */
export function setRoomName(roomName) {
    return {
        type: REMOTE_CONTROL_SET_ROOM_NAME,
        roomName
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
