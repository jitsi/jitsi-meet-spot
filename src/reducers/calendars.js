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
            events: action.events || []
        };

    case 'CALENDAR_SET_EVENTS':
        return {
            ...state,
            events: action.events
        };

    case 'CALENDAR_REMOVE_ACCOUNT':
        return state;

    default:
        return state
    }
}

export function getCalendarEvents(state) {
    return state['calendars'].events;
}

export function getCalendarName(state) {
    return state['calendars'].name;
}

export default calendarAccounts;
