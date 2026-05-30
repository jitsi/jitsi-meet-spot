import { getCalendarConfig } from '../config/selectors';

import { calendarTypes } from './constants';

/**
 * A selector which returns whether the calendar backend has been enabled or not.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isCalendarEnabled(state: any): boolean {
    const { BACKEND } = getCalendarConfig(state);

    return Boolean(BACKEND && BACKEND.SERVICE_URL);
}

/**
 * A selector which returns the email associated with the currently configured
 * calendar.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getCalendarEmail(state: any): string {
    return state.calendars.email;
}

/**
 * A selector which returns the last error that occurred while interacting with
 * the calendar service.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getCalendarError(state: any): string {
    return state.calendars.error;
}

/**
* A selector which returns calendar events associated with the currently
* configured calendar.
*
* @param state - The Redux state.
* @returns
*/
export function getCalendarEvents(state: any): Array<any> {
    return state.calendars.events;
}

/**
* A selector which returns the name to show associated with the currently
* configured calendar.
*
* @param state - The Redux state.
* @returns
*/
export function getCalendarName(state: any): string {
    return state.calendars.displayName;
}

/**
 * A selector which returns the type of the currently selected calendar integration.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getCalendarType(state: any): string {
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
* @param state - The Redux state.
* @returns
*/
export function hasCalendarBeenFetched(state: any): boolean {
    return state.calendars.hasSetEvents;
}
