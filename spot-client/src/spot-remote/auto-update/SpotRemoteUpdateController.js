import { isSpot } from 'common/app-state';
import { UPDATE_WEB_SOURCE } from 'common/auto-update';
import { MiddlewareRegistry } from 'common/redux';

import { updateSpotRemoteSource } from '../app-state';


MiddlewareRegistry.register(({ dispatch, getState }) => next => action => {
    const result = next(action);

    switch (action.type) {
    case UPDATE_WEB_SOURCE:
        !isSpot(getState()) && dispatch(updateSpotRemoteSource());
        break;
    }

    return result;
});

