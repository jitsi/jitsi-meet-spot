import {
    CALENDAR_ADD_ACCOUNT,
    CALENDAR_SET_EVENTS,
    REMOTE_CONTROL_SET_LOCAL_ID,
    SETUP_COMPLETED
} from 'reducers';

/**
 * Signals a calendar has been selected to be displayed in the application.
 *
 * @param {string} name - The email address of the calendar to be connected with
 * the application.
 * @param {string} displayName - The name to associate the calendar.
 */
export function setCalendar(name, displayName) {
    return {
        type: CALENDAR_ADD_ACCOUNT,
        name,
        displayName
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
 * Signals to update the known id of the participant the application has used
 * to connect to the XMPP service. The id is used so remote controllers can
 * connect to the XMPP service and send messages to control the application.
 *
 * @param {string} id - The id (jid) of the application's participant that has
 * connected to the XMPP service.
 * @returns {Object}
 */
export function setLocalRemoteControlID(id) {
    return {
        type: REMOTE_CONTROL_SET_LOCAL_ID,
        id
    };
}

/**
 * Signals that the application setup flow has been successfully completed and
 * should no longer be displayed.
 *
 * @returns {Object}
 */
export function setSetupCompleted() {
    return {
        type: SETUP_COMPLETED
    };
}
