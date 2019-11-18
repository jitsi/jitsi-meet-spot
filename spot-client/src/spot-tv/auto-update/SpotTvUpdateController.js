import { isSpot } from 'common/app-state';
import { SET_OK_TO_UPDATE, UPDATE_WEB_SOURCE } from 'common/auto-update';
import { MiddlewareRegistry } from 'common/redux';

import { updateSpotTVSource } from '../app-state';
import { nativeController } from '../native-functions/native-controller';


MiddlewareRegistry.register(({ dispatch, getState }) => next => action => {
    const result = next(action);

    switch (action.type) {
    case SET_OK_TO_UPDATE:
        // Let the spot-electron know that it's okay(or not) to do an update if available.
        nativeController.sendMessage('spot-electron/auto-updater', { updateAllowed: action.okToUpdate });
        break;
    case UPDATE_WEB_SOURCE:
        isSpot(getState()) && dispatch(updateSpotTVSource());
        break;
    }

    return result;
});
