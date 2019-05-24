import { MiddlewareRegistry } from 'common/redux';
import { spotRemoteRemoteControlService } from 'common/remote-control';

import { ADJUST_VOLUME, SUBMIT_FEEDBACK } from './action-types';

MiddlewareRegistry.register(() => next => action => {
    const result = next(action);

    switch (action.type) {
    case ADJUST_VOLUME:
        spotRemoteRemoteControlService.adjustVolume(action.direction);
        break;
    case SUBMIT_FEEDBACK: {
        spotRemoteRemoteControlService.submitFeedback({
            score: action.score,
            message: action.message
        });
        break;
    }
    }

    return result;
});
