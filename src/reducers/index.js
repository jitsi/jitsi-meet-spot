import { combineReducers } from 'redux';
import calendars from './calendars';
import notifications from './notifications';
import remoteControl from './remote-control';
import setup from './setup';

export const protoState = combineReducers({
    calendars,
    notifications,
    remoteControl,
    setup
});

export * from './calendars';
export * from './notifications';
export * from './remote-control';
export * from './setup';
