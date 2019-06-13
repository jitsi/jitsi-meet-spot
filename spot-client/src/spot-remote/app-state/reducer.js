import { ReducerRegistry } from 'common/redux';

import {
    SPOT_REMOTE_COMPLETED_ONBOARDING,
    SPOT_REMOTE_JOIN_CODE_INVALID,
    SPOT_REMOTE_JOIN_CODE_VALID,
    SPOT_REMOTE_WILL_VALIDATE_JOIN_CODE
} from './actionTypes';

/**
 * A {@code Reducer} to update the current Redux state for the Spot Remote.
 *
 * @param {Object} state - The current Redux state for the Spot Remote.
 * @param {Object} action - The Redux state update payload.
 * @returns {Object}
 */
ReducerRegistry.register('spotRemote', (state = { }, action) => {
    switch (action.type) {
    case SPOT_REMOTE_COMPLETED_ONBOARDING:
        return {
            ...state,
            completedOnboarding: true
        };
    case SPOT_REMOTE_JOIN_CODE_VALID:
        return {
            ...state,
            roomInfo: action.roomInfo
        };
    case SPOT_REMOTE_JOIN_CODE_INVALID:
    case SPOT_REMOTE_WILL_VALIDATE_JOIN_CODE:
        return {
            ...state,
            roomInfo: undefined
        };

    default:
        return state;
    }
});
