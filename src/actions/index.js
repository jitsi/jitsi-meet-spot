import {
    CALENDAR_ADD_ACCOUNT,
    CALENDAR_SET_EVENTS,
    LOAD_COMPLETED,
    REMOTE_CONTROL_SET_LOCAL_ID,
    SETUP_COMPLETED
} from 'reducers';

export function setLoadCompleted() {
    return {
        type: LOAD_COMPLETED
    };
}

export function setCalendar(name, displayName) {
    return {
        type: CALENDAR_ADD_ACCOUNT,
        name,
        displayName
    };
}

export function setCalendarEvents(events = []) {
    return {
        type: CALENDAR_SET_EVENTS,
        events
    };
}

export function setLocalRemoteControlID(id) {
    return {
        type: REMOTE_CONTROL_SET_LOCAL_ID,
        id
    };
}

export function setSetupCompleted() {
    return {
        type: SETUP_COMPLETED
    };
}
