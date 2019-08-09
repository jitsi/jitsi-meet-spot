import { analytics } from 'common/analytics';
import { MiddlewareRegistry } from 'common/redux';

import {
    SPOT_TV_PAIR_TO_BACKEND_FAIL,
    SPOT_TV_PAIR_TO_BACKEND_PENDING,
    SPOT_TV_PAIR_TO_BACKEND_SUCCESS
} from '../backend';

import { backendPairingEvents } from './events';

MiddlewareRegistry.register(() => next => action => {
    switch (action.type) {
    case SPOT_TV_PAIR_TO_BACKEND_FAIL:
        analytics.log(backendPairingEvents.VALIDATE_FAIL);
        break;

    case SPOT_TV_PAIR_TO_BACKEND_PENDING:
        analytics.log(backendPairingEvents.SUBMIT);
        break;

    case SPOT_TV_PAIR_TO_BACKEND_SUCCESS:
        analytics.log(backendPairingEvents.VALIDATE_SUCCESS);
        break;
    }

    return next(action);
});
