import { MiddlewareRegistry } from 'common/redux';

import { SET_DEVICE_ID } from '../app-state/device-id';
import { getPermanentPairingCode, SET_PERMANENT_PAIRING_CODE } from '../backend';

import analytics from './analytics';
import { permanentPairingCodeEvents } from './analyticsEvents';

MiddlewareRegistry.register(({ getState }) => next => action => {
    switch (action.type) {
    case SET_DEVICE_ID:
        analytics.updateId(action.deviceId);

        break;
    case SET_PERMANENT_PAIRING_CODE:
        return _permanentPairingAnalytics({ getState }, next, action);
    }

    return next(action);
});

/**
 * Figures out the analytic events for permanent backend pairing.
 *
 * @param {Object} store - The Redux store.
 * @param {Function} next - Some Redux magic function used to continue with processing the given action.
 * @param {Object} action - The action that is currently being processed.
 * @returns {*}
 * @private
 */
function _permanentPairingAnalytics({ getState }, next, action) {
    // Lack of permanentPairingCode value means that it's cleared because the pairing has failed
    const { permanentPairingCode } = action;

    if (permanentPairingCode) {
        // Emit success only if there's a new pairing being established
        if (getPermanentPairingCode(getState()) !== permanentPairingCode) {
            analytics.log(permanentPairingCodeEvents.PAIRING_SUCCESS);
        }
    } else if (getPermanentPairingCode(getState())) {
        // Emit failure only if there was a permanent code stored already
        analytics.log(permanentPairingCodeEvents.PAIRING_FAIL);
    }

    // The action executed, before it gets reduced, so that the store holds the old pairing code
    return next(action);
}
