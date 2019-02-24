import { combineReducers } from 'redux';
import calendars from './calendars';
import config from './config';
import notifications from './notifications';
import remoteControl from './remote-control';
import setup from './setup';
import wiredScreenshare from './wired-screenshare';

export const protoState = combineReducers({
    calendars,
    config,
    notifications,
    remoteControl,
    setup,
    wiredScreenshare
});

export * from './calendars';
export * from './config';
export * from './notifications';
export * from './remote-control';
export * from './setup';
export * from './wired-screenshare';
