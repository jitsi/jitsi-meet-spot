import { analytics } from 'common/analytics';
import { MiddlewareRegistry } from 'common/redux';

import {
    SET_PERMANENT_PAIRING_CODE,
    SPOT_TV_PAIR_TO_BACKEND_FAIL,
    SPOT_TV_PAIR_TO_BACKEND_PENDING,
    SPOT_TV_PAIR_TO_BACKEND_SUCCESS,
    getPermanentPairingCode
} from '../backend';

import { backendPairingEvents, permanentPairingCodeEvents } from './events';

MiddlewareRegistry.register(({ getState }) => next => action => {


    switch (action.type) {
    case SET_PERMANENT_PAIRING_CODE: {
        // Lack of permanentPairingCode value means that it's cleared because the pairing has failed
        const { permanentPairingCode } = action;

        // Every failure is reported and only the first successful pairing (because the pairing code is persisted)
        if (!permanentPairingCode
            || getPermanentPairingCode(getState()) !== permanentPairingCode) {
            analytics.log(
                permanentPairingCode
                    ? permanentPairingCodeEvents.PAIRING_SUCCESS
                    : permanentPairingCodeEvents.PAIRING_FAIL);
        }
        break;
    }
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
