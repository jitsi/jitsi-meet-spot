import { REMOTE_CONTROL_REQUEST_STATE } from './actionTypes';

const DEFAULT_STATE = {};

/**
 * A {@code Reducer} to update the current Redux state for the
 * 'remoteControlService' feature.
 *
 * @param {Object} state - The current Redux state for the 'setup' feature.
 * @param {Object} action - The Redux state update payload.
 * @returns {Object}
 */
const remoteControlService = (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case REMOTE_CONTROL_REQUEST_STATE:
        return {
            ...state,
            [action.requestType]: {
                requestState: action.requestState,
                expectedState: action.expectedState
            }
        };
    default:
        return state;
    }
};

export default remoteControlService;
