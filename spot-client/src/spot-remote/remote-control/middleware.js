import { MiddlewareRegistry } from 'common/redux';
import { remoteControlService } from 'common/remote-control';

import { SUBMIT_FEEDBACK } from './action-types';

MiddlewareRegistry.register(() => next => action => {
    const result = next(action);

    switch (action.type) {
    case SUBMIT_FEEDBACK: {
        remoteControlService.submitFeedback({
            score: action.score,
            message: action.message
        });
        break;
    }
    }

    return result;
});
