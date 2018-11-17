const DEFAULT_STATE = {
    name: null,
    displayName: null,
    events: []
};

export const CALENDAR_ADD_ACCOUNT = 'CALENDAR_ADD_ACCOUNT';
export const CALENDAR_SET_EVENTS = 'CALENDAR_SET_EVENTS';

/**
 * A {@code Reducer} to update the current Redux state for the 'calendar'
 * feature. The 'calendar' feature stores the calendar from which to fetch
 * events and the events themselves.
 *
 * @param {Object} state - The current Redux state for the 'setup' feature.
 * @param {Object} action - The Redux state update payload.
 */
const calendar = (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case CALENDAR_ADD_ACCOUNT:
        return {
            ...state,
            name: action.name,
            displayName: action.displayName,
            events: []
        };

    case CALENDAR_SET_EVENTS:
        return {
            ...state,
            events:
                filterJoinableEvents(state.events, action.events, state.name)
        };

    default:
        return state;
    }
};

/**
 * Removes the currently configured calendar from the attendees.
 *
 * @param {Array<Object>} attendees
 * @param {string} currentCalendar
 */
function filterAttendees(attendees = [], currentCalendar) {
    const otherAttendees = attendees.filter(attendee =>
        attendee.email !== currentCalendar);

    return otherAttendees.map(attendee => {
        return {
            email: attendee.email
        };
    });
}

/**
 * Converts the passed in events into a standard format expected by the
 * application.
 *
 * @param {Array<Object>} currentEvents
 * @param {Array<Object>} newEvents
 * @param {string} currentCalendar
 */
function filterJoinableEvents(currentEvents, newEvents = [], currentCalendar) {
    // TODO do not create new objects if unnecessary. Right now a new array is
    // created with each call, causing unnecessary re-renders.
    const events = newEvents.map(event => {
        const { attendees, location, end, id, start, summary } = event;

        return {
            conferenceUrl: parseConferenceUrl(location),
            conferenceName: parseConferenceName(location),
            end: end.dateTime,
            id,
            meetingName: summary,
            participants: filterAttendees(attendees, currentCalendar),
            start: start.dateTime
        };
    });

    return events;
}

/**
 * Extrapolates a jitsi conference name from a given string.
 *
 * @param {string} location - A string which may contains a jitsi conference
 * url.
 * @private
 * @returns {string}
 */
function parseConferenceName(location) {
    // eslint-disable-next-line no-useless-escape
    const linkRegex = /https?:\/\/[^\s]+\/([^\s\/]+)/g;
    const matches = linkRegex.exec(location);

    if (!matches || matches.length < 2) {
        return;
    }

    // eslint-disable-next-line no-useless-escape
    return matches[1].replace(/,\s*$/, '');
}

/**
 * Extrapolates a jitsi conference url from a given string.
 *
 * @param {string} location - A string which may contains a jitsi conference
 * url.
 * @private
 * @returns {string}
 */
function parseConferenceUrl(location) {
    // eslint-disable-next-line no-useless-escape
    const linkRegex = /https?:\/\/[^\s]+\/([^\s\/]+)/g;
    const matches = linkRegex.exec(location);

    if (!matches || !matches.length) {
        return;
    }

    // eslint-disable-next-line no-useless-escape
    return matches[0].replace(/,\s*$/, '');
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
 * A selector which returns the email associated with the currently configured
 * calendar.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getCalendarName(state) {
    return state.calendars.name;
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
