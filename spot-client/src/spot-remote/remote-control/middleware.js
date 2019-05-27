import { MiddlewareRegistry } from 'common/redux';
import { remoteControlClient } from 'common/remote-control';

import { ADJUST_VOLUME, SUBMIT_FEEDBACK } from './action-types';

MiddlewareRegistry.register(() => next => action => {
    const result = next(action);

    switch (action.type) {
    case ADJUST_VOLUME:
        remoteControlClient.adjustVolume(action.direction);
        break;
    case SUBMIT_FEEDBACK: {
        remoteControlClient.submitFeedback({
            score: action.score,
            message: action.message
        });
        break;
    }
    }

    return result;
});
