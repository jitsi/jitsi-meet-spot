const defaultState = {
    name: null,
    events: []
};

const calendarAccounts = (state = defaultState, action) => {
    switch (action.type) {
    case 'CALENDAR_ADD_ACCOUNT':
        return {
            ...state,
            name: action.name,
            events: []
        };

    case 'CALENDAR_SET_EVENTS':
        return {
            ...state,
            events: filterJoinableEvents(state.events, action.events)
        };

    case 'CALENDAR_REMOVE_ACCOUNT':
        return state;

    default:
        return state
    }
}

// TODO do not create new objects if unnecessary. Right now filterJoinableEvents
// creates new objects and a new array with each call, causing unnecessary
// re-renders.
function filterJoinableEvents(currentEvents, newEvents = []) {
    const meetingsWithLinks = newEvents.filter(event => {
        // TODO make this smarter by verifying room name as well and protocol
        return event.location.includes('meet.jit.si');
    });

    const events = meetingsWithLinks.map(event => {
        const { attendees, location, end, id, start } = event;

        return {
            name: parseMeetingLocation(location),
            end: end.dateTime,
            id,
            participants: attendees,
            start: start.dateTime
        };
    });

    return events;
}

function parseMeetingLocation(location) {
    // eslint-disable-next-line no-useless-escape
    const linkRegex = /https?:\/\/[^\s]+\/([^\s\/]+)/g;
    const matches = linkRegex.exec(location);

    // eslint-disable-next-line no-useless-escape
    return matches[1].replace(/,\s*$/, '');
}

export function getCalendarEvents(state) {
    return state['calendars'].events;
}

export function getCalendarName(state) {
    return state['calendars'].name;
}

export default calendarAccounts;
