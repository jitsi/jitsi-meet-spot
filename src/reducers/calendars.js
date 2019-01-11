const DEFAULT_STATE = {
    name: undefined,
    displayName: undefined,
    events: []
};

export const CALENDAR_SET_ACCOUNT = 'CALENDAR_SET_ACCOUNT';
export const CALENDAR_SET_EVENTS = 'CALENDAR_SET_EVENTS';

/**
 * A {@code Reducer} to update the current Redux state for the 'calendar'
 * feature. The 'calendar' feature stores the calendar from which to fetch
 * events and the events themselves.
 *
 * @param {Object} state - The current Redux state for the 'setup' feature.
 * @param {Object} action - The Redux state update payload.
 * @returns {Object}
 */
const calendar = (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case CALENDAR_SET_ACCOUNT:
        return {
            ...state,
            displayName: action.displayName,
            email: action.email,
            events: [],
            calendarType: action.calendarType
        };

    case CALENDAR_SET_EVENTS:
        return {
            ...state,
            events: action.events
        };

    default:
        return state;
    }
};

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
export function getDisplayName(state) {
    return state.calendars.displayName;
}

export default calendar;
