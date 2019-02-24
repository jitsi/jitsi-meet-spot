import { combineReducers } from 'redux';

import calendars from './calendars/reducer';
import config from './config/reducer';
import notifications from './notifications/reducer';
import remoteControl from './remote-control/reducer';
import setup from './setup/reducer';
import wiredScreenshare from './wired-screenshare/reducer';

const reducers = combineReducers({
    calendars,
    config,
    notifications,
    remoteControl,
    setup,
    wiredScreenshare
});

export default reducers;

export * from './calendars/actions';
export * from './notifications/actions';
export * from './remote-control/actions';
export * from './setup/actions';
export * from './wired-screenshare/actions';

export * from './calendars/selectors';
export * from './config/selectors';
export * from './notifications/selectors';
export * from './remote-control/selectors';
export * from './setup/selectors';
export * from './wired-screenshare/selectors';
