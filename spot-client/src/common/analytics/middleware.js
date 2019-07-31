import { MiddlewareRegistry } from 'common/redux';

import { SET_DEVICE_ID } from '../app-state/device-id';

import analytics from './analytics';

MiddlewareRegistry.register(() => next => action => {
    const result = next(action);

    switch (action.type) {
    case SET_DEVICE_ID:
        analytics.updateId(action.deviceId);

        break;
    }

    return result;
});
