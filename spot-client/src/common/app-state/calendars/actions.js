import {
    CALENDAR_SET_ACCOUNT,
    CALENDAR_SET_ERROR,
    CALENDAR_SET_EVENTS
} from './action-types';

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
 * Signals an error has occurred with the calendar service.
 *
 * @param {Object} error - The error object describing what occurred.
 * @returns {Object}
 */
export function setCalendarError(error) {
    return {
        type: CALENDAR_SET_ERROR,
        error
    };
}

/**
 * Signals to replace the currently known calendar events.
 *
 * @param {Array<Object>} events - The calendar events to display.
 * @param  {Object} [extras] - Extra flags supplied by the calendar service.
 * @param  {boolean} isPolling - When set to true it means that the update was sourced by polling, when set to false it
 * means the update came as a result of the calendar push notification.
 * @returns {Object}
 */
export function setCalendarEvents(events = [], { isPolling } = { }) {
    return {
        type: CALENDAR_SET_EVENTS,
        events,
        isPolling
    };
}
