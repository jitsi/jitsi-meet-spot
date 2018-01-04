export function loadComplete() {
    return {
        type: 'LOAD_COMPLETED'
    };
}

export function setCalendar(name, events = []) {
    return {
        type: 'CALENDAR_ADD_ACCOUNT',
        name,
        events
    };
}

export function setCalendarEvents(events = []) {
    return {
        type: 'CALENDAR_SET_EVENTS',
        events
    };
}

export function setSetupCompleted(completed, apiKey, clientId) {
    return {
        type: 'SETUP_COMPLETED',
        apiKey,
        clientId,
        completed
    };
}
