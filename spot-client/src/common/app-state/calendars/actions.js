import {
    CALENDAR_SET_ACCOUNT,
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
