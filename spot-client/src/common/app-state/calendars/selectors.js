import { getCalendarConfig } from '../config/selectors';

import { calendarTypes } from './constants';

/**
 * A selector which returns whether the calendar backend has been enabled or not.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isCalendarEnabled(state) {
    const { BACKEND } = getCalendarConfig(state);

    return Boolean(BACKEND && BACKEND.SERVICE_URL);
}

/**
 * A selector which returns the email associated with the currently configured
 * calendar.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getCalendarEmail(state) {
    return state.calendars.email;
}

/**
 * A selector which returns the last error that occurred while interacting with
 * the calendar service.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getCalendarError(state) {
    return state.calendars.error;
}

/**
* A selector which returns calendar events associated with the currently
* configured calendar.
*
* @param {Object} state - The Redux state.
* @returns {Array<Object>}
*/
export function getCalendarEvents(state) {
    return state.calendars.events;
}

/**
* A selector which returns the name to show associated with the currently
* configured calendar.
*
* @param {Object} state - The Redux state.
* @returns {string}
*/
export function getCalendarName(state) {
    return state.calendars.displayName;
}

/**
 * A selector which returns the type of the currently selected calendar integration.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getCalendarType(state) {
    const { BACKEND } = getCalendarConfig(state);

    if (BACKEND && BACKEND.SERVICE_URL) {
        return calendarTypes.BACKEND;
    }

    return state.calendars.calendarType;
}

/**
* A selector which returns whether or not calendar events have ever been
* updated during this session.
*
* @param {Object} state - The Redux state.
* @returns {boolean}
*/
export function hasCalendarBeenFetched(state) {
    return state.calendars.hasSetEvents;
}
