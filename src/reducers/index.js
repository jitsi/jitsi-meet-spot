import { combineReducers } from 'redux';
import calendars from './calendars';
import config from './config';
import remoteControl from './remote-control';
import setup from './setup';

export const protoState = combineReducers({
    calendars,
    config,
    remoteControl,
    setup
});

export * from './calendars';
export * from './config';
export * from './remote-control';
export * from './setup';
