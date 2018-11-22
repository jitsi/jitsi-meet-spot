import {
    CALENDAR_SET_ACCOUNT,
    CALENDAR_SET_EVENTS,
    REMOTE_CONTROL_SET_LOCAL_ID,
    SETUP_COMPLETED
} from 'reducers';

/**
 * Signals a calendar has been selected to be displayed in the application.
 *
 * @param {string} email - The email address of the calendar to be connected
 * with Spot.
 * @param {string} displayName - The name to associate the calendar.
 */
export function setCalendar(email, displayName) {
    return {
        type: CALENDAR_SET_ACCOUNT,
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
