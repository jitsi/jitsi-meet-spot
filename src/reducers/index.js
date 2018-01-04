import { combineReducers } from 'redux'
import calendars from './calendars';
import setup from './setup';

export const protoState = combineReducers({
    calendars,
    setup
});

export * from './calendars';
export * from './setup';
