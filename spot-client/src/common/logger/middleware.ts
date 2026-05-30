import { MiddlewareRegistry } from 'common/redux';

import { getLoggingEndpoint } from '../app-state/config/selectors';
import { SET_DEVICE_ID, getDeviceId } from '../app-state/device-id';

import { createLoggingService } from './actions';
import logger from './logger';
import { getLoggingService } from './selector';

MiddlewareRegistry.register((store: any) => (next: any) => (action: any) => {
    switch (action.type) {
    case SET_DEVICE_ID:
        return _setDeviceId(store, next, action);
    }

    return next(action);
});

/**
 * Handles the device ID change.
 *
 * @param store - The Redux store.
 * @param next - Some Redux magic function used to continue with processing the given action.
 * @param action - The action that is currently being processed.
 * @returns {*}
 * @private
 */
function _setDeviceId({ dispatch, getState }: any, next: any, action: any) {
    const oldDeviceId = getDeviceId(getState());
    const newDeviceId = action.deviceId;
    const result = next(action);
    const loggingService = getLoggingService(getState());

    if (loggingService) {
        logger.log('Device ID will change', {
            newDeviceId,
            oldDeviceId
        });
        loggingService.updateDeviceId(newDeviceId);
        logger.log('Device ID changed', {
            newDeviceId,
            oldDeviceId
        });
    } else {
        const loggingEndpoint = getLoggingEndpoint(getState());

        if (loggingEndpoint) {
            dispatch(createLoggingService(newDeviceId, loggingEndpoint));
        }
    }

    return result;
}
