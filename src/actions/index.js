export function loadComplete() {
    return {
        type: 'LOAD_COMPLETED'
    };
}

export function setCalendar(name) {
    return {
        type: 'CALENDAR_ADD_ACCOUNT',
        name
    };
}

export function setCalendarEvents(events = []) {
    return {
        type: 'CALENDAR_SET_EVENTS',
        events
    };
}

export function setSetupCompleted(completed, clientId) {
    return {
        type: 'SETUP_COMPLETED',
        clientId,
        completed
    };
}

export function updateGoogleClient(clientId) {
    return {
        type: 'SET_GOOGLE_CLIENT',
        clientId
    };
}
