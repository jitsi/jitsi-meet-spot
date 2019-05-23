import calendars from './calendars/reducer';
import config from './config/reducer';
import modal from './modal/reducer';
import notifications from './notifications/reducer';
import remoteControlService from './remote-control-service/reducer';
import setup from './setup/reducer';
import spotTv from './spot-tv/reducer';
import wiredScreenshare from './wired-screenshare/reducer';

const reducers = {
    calendars,
    config,
    modal,
    notifications,
    remoteControlService,
    setup,
    spotTv,
    wiredScreenshare
};

export default reducers;

export * from './calendars/actions';
export * from './modal/actions';
export * from './notifications/actions';
export * from './remote-control-service/actions';
export * from './setup/actions';
export * from './spot-tv/actions';
export * from './wired-screenshare/actions';

export * from './remote-control-service/actionTypes';

export * from './calendars/constants';

export * from './calendars/selectors';
export * from './config/selectors';
export * from './notifications/selectors';
export * from './remote-control-service/selectors';
export * from './modal/selectors';
export * from './setup/selectors';
export * from './spot-tv/selectors';
export * from './wired-screenshare/selectors';

export * from './config/set-default-values';
