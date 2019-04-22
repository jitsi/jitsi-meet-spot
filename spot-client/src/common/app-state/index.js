import { combineReducers } from 'redux';

import bootstrap from './bootstrap/reducer';
import calendars from './calendars/reducer';
import config from './config/reducer';
import notifications from './notifications/reducer';
import remoteControlService from './remote-control-service/reducer';
import setup from './setup/reducer';
import spotTv from './spot-tv/reducer';
import wiredScreenshare from './wired-screenshare/reducer';

// TODO: Port over jitsi-meet's ReducerRegistry to match jitsi-meet behavior and
// the Spot app's middleware registration behavior.
const reducers = combineReducers({
    bootstrap,
    calendars,
    config,
    notifications,
    remoteControlService,
    setup,
    spotTv,
    wiredScreenshare
});

export default reducers;

export * from './bootstrap';
export * from './calendars';
export * from './config';
export * from './notifications';
export * from './remote-control-service';
export * from './setup';
export * from './spot-tv';
export * from './wired-screenshare';


