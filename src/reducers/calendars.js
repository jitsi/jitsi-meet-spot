const DEFAULT_STATE = {
    name: null,
    displayName: null,
    events: []
};

export const CALENDAR_ADD_ACCOUNT = 'CALENDAR_ADD_ACCOUNT';
export const CALENDAR_SET_EVENTS = 'CALENDAR_SET_EVENTS';

const calendarAccounts = (state = DEFAULT_STATE, action) => {
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

function filterAttendees(attendees = [], currentCalendar) {
    const otherAttendees = attendees.filter(attendee =>
        attendee.email !== currentCalendar);

    return otherAttendees.map(attendee => {
        return {
            email: attendee.email
        };
    });
}

// TODO do not create new objects if unnecessary. Right now filterJoinableEvents
// creates new objects and a new array with each call, causing unnecessary
// re-renders.
function filterJoinableEvents(currentEvents, newEvents = [], currentCalendar) {
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

export function getCalendarEvents(state) {
    return state.calendars.events;
}

export function getCalendarName(state) {
    return state.calendars.name;
}

export function getDisplayName(state) {
    return state.calendars.displayName;
}

export default calendarAccounts;
