import {
    CALENDAR_SET_ACCOUNT,
    CALENDAR_SET_ERROR,
    CALENDAR_SET_EVENTS
} from './action-types';

interface ICalendarState {
    calendarType?: any;
    displayName?: any;
    email?: any;
    error?: any;
    events: any[];
    hasSetEvents: boolean;
}

const DEFAULT_STATE: ICalendarState = {
    calendarType: undefined,
    displayName: undefined,
    email: undefined,
    error: undefined,
    events: [],
    hasSetEvents: false
};

/**
 * A {@code Reducer} to update the current Redux state for the 'calendar'
 * feature. The 'calendar' feature stores the calendar from which to fetch
 * events and the events themselves.
 *
 * @param state - The current Redux state for the 'setup' feature.
 * @param action - The Redux state update payload.
 * @returns {Object}
 */
const calendar = (state: ICalendarState = DEFAULT_STATE, action: any): ICalendarState => {
    switch (action.type) {
    case CALENDAR_SET_ACCOUNT:
        return {
            ...state,
            calendarType: action.calendarType,
            displayName: action.displayName,
            email: action.email,
            error: undefined,
            events: [],
            hasSetEvents: false
        };

    case CALENDAR_SET_ERROR: {
        return {
            ...state,
            error: action.error
        };
    }

    case CALENDAR_SET_EVENTS:
        return {
            ...state,
            error: undefined,
            events: action.events,
            hasSetEvents: true
        };

    default:
        return state;
    }
};

export default calendar;
