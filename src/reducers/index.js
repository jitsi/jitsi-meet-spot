import { combineReducers } from 'redux';
import calendars from './calendars';
import remoteControl from './remote-control';
import setup from './setup';

export const protoState = combineReducers({
    calendars,
    remoteControl,
    setup
});

export * from './calendars';
export * from './remote-control';
export * from './setup';
