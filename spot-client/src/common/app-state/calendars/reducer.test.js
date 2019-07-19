import calendarsReducer from './reducer';
import * as types from './action-types';

describe('calendars reducer', () => {
    const previousState = {
        calendarType: 'old-type',
        displayName: 'old-cal',
        error: 'some-error',
        hasSetEvents: true,
        events: [ { 1: 1 } ]
    };

    it('returns a default state', () => {
        const state = calendarsReducer(undefined, {});

        expect(state).toEqual({
            calendarType: undefined,
            displayName: undefined,
            email: undefined,
            error: undefined,
            events: [],
            hasSetEvents: false,
            name: undefined
        });
    });

    describe('setting a calendar', () => {
        it('resets state for the new account', () => {
            const action = {
                type: types.CALENDAR_SET_ACCOUNT,
                calendarType: 'new-type',
                displayName: 'new-cal'
            };

            expect(calendarsReducer(previousState, action))
                .toEqual({
                    calendarType: action.calendarType,
                    displayName: action.displayName,
                    events: [],
                    hasSetEvents: false
                });
        });
    });

    describe('settings errors', () => {
        it('saves the error', () => {
            const action = {
                type: types.CALENDAR_SET_ERROR,
                error: 'new-error'
            };

            expect(calendarsReducer(previousState, action))
                .toEqual({
                    ...previousState,
                    error: action.error
                });
        });
    });

    describe('settings events', () => {
        const action = {
            type: types.CALENDAR_SET_EVENTS,
            events: [ { new: 'new' } ]
        };

        it('clears errors', () => {
            const newState = calendarsReducer(previousState, action);

            expect(newState.error).toBeFalsy();
        });

        it('saves the events', () => {
            const newState = calendarsReducer(previousState, action);

            expect(newState.events).toEqual(newState.events);
        });

        it('marks that events have been saved', () => {
            const newState = calendarsReducer({ hasSetEvents: false }, action);

            expect(newState.hasSetEvents).toEqual(true);
        });
    });
});
