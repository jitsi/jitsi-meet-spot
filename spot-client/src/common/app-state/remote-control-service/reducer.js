import {
    JOIN_WITH_SCREENSHARING,
    REMOTE_CONTROL_REQUEST_STATE,
    REMOTE_CONTROL_UPDATE_SCREENSHARE_STATE
} from './actionTypes';

const DEFAULT_STATE = {
    isWirelessScreensharing: false
};

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
    case REMOTE_CONTROL_UPDATE_SCREENSHARE_STATE:
        return {
            ...state,
            isWirelessScreensharing: action.isSharing,
            joinWithScreensharing: undefined
        };

    case REMOTE_CONTROL_REQUEST_STATE:
        return {
            ...state,
            [action.requestType]: {
                requestState: action.requestState,
                expectedState: action.expectedState
            }
        };
    case JOIN_WITH_SCREENSHARING:
        return {
            ...state,
            joinWithScreensharing: action.screensharingType
        };
    default:
        return state;
    }
};

export default remoteControlService;
