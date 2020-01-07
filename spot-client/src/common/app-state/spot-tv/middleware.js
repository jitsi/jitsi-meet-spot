import { MiddlewareRegistry } from 'common/redux';
import { nativeController } from 'spot-tv/native-functions/native-controller';

import { SPOT_TV_SET_STATE } from './action-types';

MiddlewareRegistry.register(() => next => action => {
    const result = next(action);

    switch (action.type) {
    case SPOT_TV_SET_STATE:
        if (action.newState.audioMuted !== undefined) {
            nativeController.sendMessage('mutedState', action.newState.audioMuted);
        }
        break;
    }

    return result;
});
