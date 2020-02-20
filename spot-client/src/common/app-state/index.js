import './spot-tv/middleware';

import bootstrap from './bootstrap/reducer';
import calendars from './calendars/reducer';
import config from './config/reducer';
import deviceId from './device-id/reducer';
import feedback from './feedback/reducer';
import modal from './modal/reducer';
import notifications from './notifications/reducer';
import remoteControlService from './remote-control-service/reducer';
import route from './route/reducer';
import setup from './setup/reducer';
import spotTv from './spot-tv/reducer';
import wiredScreenshare from './wired-screenshare/reducer';

const reducers = {
    bootstrap,
    calendars,
    config,
    deviceId,
    feedback,
    modal,
    notifications,
    remoteControlService,
    route,
    setup,
    spotTv,
    wiredScreenshare
};

export default reducers;

export * from './api';
export * from './bootstrap';
export * from './calendars/actions';
export * from './device-id';
export * from './feedback/actions';
export * from './modal/actions';
export * from './notifications/actions';
export * from './remote-control-service/actions';
export * from './route/actions';
export * from './setup/actions';
export * from './setup/action-types';
export * from './spot-tv/actions';
export * from './spot-tv/action-types';
export * from './wired-screenshare/actions';

export * from './calendars/action-types';
export * from './feedback/actionTypes';
export * from './remote-control-service/actionTypes';

export * from './calendars/constants';
export * from './remote-control-service/constants';

export * from './calendars/selectors';
export * from './config/selectors';
export * from './feedback/selectors';
export * from './notifications/selectors';
export * from './remote-control-service/selectors';
export * from './modal/selectors';
export * from './route/selectors';
export * from './setup/selectors';
export * from './spot-tv/selectors';
export * from './wired-screenshare/selectors';

export * from './config/set-default-values';
