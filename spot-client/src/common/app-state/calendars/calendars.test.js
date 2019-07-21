import { combineReducers, createStore } from 'redux';

import * as actions from './actions';
import calendarReducer from './reducer';
import * as selectors from './selectors';

describe('calendars state', () => {
    let dispatch, getState;

    beforeEach(() => {
        ({ dispatch, getState } = createStore(combineReducers({
            calendars: calendarReducer,
            config: () => {
                return {
                    CALENDARS: {}
                };
            }
        })));
    });

    it('has empty defaults', () => {
        const state = getState();

        expect(selectors.getCalendarEmail(state)).toBeFalsy();
        expect(selectors.getCalendarError(state)).toBeFalsy();
        expect(selectors.getCalendarEvents(state)).toEqual([]);
        expect(selectors.getCalendarName(state)).toBeFalsy();
        expect(selectors.getCalendarType(state)).toBeFalsy();
        expect(selectors.hasCalendarBeenFetched(state)).toBe(false);
    });

    describe('setting a calendar', () => {
        const EMAIL = 'test-calendar-email';
        const NAME = 'test-calendar-display-name';
        const TYPE = 'test-type';

        it('sets the new calendar information', () => {
            dispatch(actions.setCalendar(EMAIL, NAME, TYPE));

            const state = getState();

            expect(selectors.getCalendarEmail(state)).toEqual(EMAIL);
            expect(selectors.getCalendarName(state)).toEqual(NAME);
            expect(selectors.getCalendarType(state)).toEqual(TYPE);
        });

        it('flags events has not having been set', () => {
            dispatch(actions.setCalendarEvents([]));
            dispatch(actions.setCalendar(EMAIL, NAME, TYPE));

            expect(selectors.hasCalendarBeenFetched(getState())).toBe(false);
        });
    });

    describe('settings errors', () => {
        it('saves the error', () => {
            const ERROR = 'test-error';

            dispatch(actions.setCalendarError(ERROR));

            expect(selectors.getCalendarError(getState())).toEqual(ERROR);
        });
    });

    describe('settings events', () => {
        const MOCK_EVENTS = [ { new: 'new' } ];

        beforeEach(() => {
            dispatch(actions.setCalendarEvents(MOCK_EVENTS));
        });

        it('saves the events', () => {
            expect(selectors.getCalendarEvents(getState())).toEqual(MOCK_EVENTS);
        });

        it('clears errors', () => {
            dispatch(actions.setCalendarError('some error'));
            dispatch(actions.setCalendarEvents(MOCK_EVENTS));

            expect(selectors.getCalendarError(getState())).toBeFalsy();
        });

        it('marks that events have been saved', () => {
            expect(selectors.hasCalendarBeenFetched(getState())).toBe(true);
        });
    });
});
