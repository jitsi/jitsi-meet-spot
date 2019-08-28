import { SUBMIT_FEEDBACK, isSpot } from 'common/app-state';
import { MiddlewareRegistry } from 'common/redux';
import { remoteControlClient } from 'common/remote-control';

import { ADJUST_VOLUME } from './action-types';

MiddlewareRegistry.register(store => next => action => {
    const result = next(action);

    switch (action.type) {
    case ADJUST_VOLUME:
        remoteControlClient.adjustVolume(action.direction);
        break;
    case SUBMIT_FEEDBACK: {
        if (!isSpot(store.getState())) {
            remoteControlClient.submitFeedback({
                score: action.score,
                message: action.message
            });
        }
        break;
    }
    }

    return result;
});
