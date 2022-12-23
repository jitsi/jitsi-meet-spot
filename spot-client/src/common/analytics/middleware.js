import { ERROR_BOUNDARY_DISPLAYED } from 'common/app-state/ui';
import { MiddlewareRegistry } from 'common/redux';

import { SET_CUSTOMER_ID, SET_ROOM_ID, SUBMIT_FEEDBACK, getSpotClientVersion } from '../app-state';
import { BOOTSTRAP_COMPLETE } from '../app-state/bootstrap';
import { SET_DEVICE_ID } from '../app-state/device-id';
import { SET_PERMANENT_PAIRING_CODE, getPermanentPairingCode } from '../backend';
import { VIEW_DISPLAYED } from '../ui/actionTypes';

import analytics from './analytics';
import {
    feedbackEvents,
    permanentPairingCodeEvents,
    uiEvents
} from './events';
import { CUSTOMER_ID, SPOT_ROOM_ID } from './properties';

MiddlewareRegistry.register(({ getState }) => next => action => {
    switch (action.type) {
    case BOOTSTRAP_COMPLETE:
        analytics.updateProperty('spotClientVersion', getSpotClientVersion(getState()));

        break;
    case ERROR_BOUNDARY_DISPLAYED: {
        const {
            error,
            info
        } = action;

        analytics.log(uiEvents.ERROR_BOUNDARY_DISPLAYED, {
            errorName: error?.name,
            errorMessage: error?.message,
            errorStack: error?.stack,
            componentStack: info?.componentStack
        });
        break;
    }

    case SET_CUSTOMER_ID:
        analytics.updateProperty(CUSTOMER_ID, action.customerId);
        break;

    case SET_DEVICE_ID:
        analytics.updateId(action.deviceId);

        break;
    case SET_PERMANENT_PAIRING_CODE:
        return _permanentPairingAnalytics({ getState }, next, action);

    case SET_ROOM_ID:
        analytics.updateProperty(SPOT_ROOM_ID, action.roomId);
        break;

    case SUBMIT_FEEDBACK:
        _submitFeedback(action);
        break;

    case VIEW_DISPLAYED:
        analytics.page(action.name);

        break;
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

/**
 * Sends analytics events for the {@link SUBMIT_FEEDBACK} action.
 *
 * @param {Object} action - The {@link SUBMIT_FEEDBACK} action.
 * @private
 * @returns {void}
 */
function _submitFeedback(action) {
    const {
        message,
        requestedMoreInfo,
        score,
        skip,
        timeout
    } = action;

    analytics.log(
        skip ? feedbackEvents.SKIP : feedbackEvents.SUBMIT, {
            message,
            requestedMoreInfo,
            score,
            timeout
        });
}
