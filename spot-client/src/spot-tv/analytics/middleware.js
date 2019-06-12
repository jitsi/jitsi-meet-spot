import { analytics } from 'common/analytics';
import { MiddlewareRegistry } from 'common/redux';

import { getPermanentPairingCode, SET_PERMANENT_PAIRING_CODE } from '../backend';

import { permanentPairingCodeEvents } from './events';

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
    }

    return next(action);
});
