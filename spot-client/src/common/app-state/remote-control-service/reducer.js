import {
    AUDIO_MUTE,
    CREATE_CONNECTION,
    DESTROY_CONNECTION,
    JOIN_WITH_SCREENSHARING,
    RECONNECTION_SCHEDULE_UPDATED,
    REMOTE_CONTROL_UPDATE_SCREENSHARE_STATE,
    SCREENSHARE,
    TILE_VIEW,
    VIDEO_MUTE
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
    case AUDIO_MUTE:
        return updateStateForAsyncAction(state, 'audioMute', action);

    case CREATE_CONNECTION:
        return updateStateForAsyncAction(state, 'connect', action);

    // This clears the 'connect' state created by CREATE_CONNECTION, so that the lack of it means the app is no longer
    // connected nor trying to connect.
    case DESTROY_CONNECTION:
        return {
            ...state,
            connect: undefined
        };

    case REMOTE_CONTROL_UPDATE_SCREENSHARE_STATE:
        return {
            ...state,
            isWirelessScreensharing: action.isSharing,
            joinWithScreensharing: undefined
        };

    case JOIN_WITH_SCREENSHARING:
        return {
            ...state,
            joinWithScreensharing: action.screensharingType
        };

    case RECONNECTION_SCHEDULE_UPDATED: {
        return {
            ...state,
            isReconnectScheduled: action.isReconnectScheduled
        };
    }

    case SCREENSHARE:
        return updateStateForAsyncAction(state, 'screenshare', action);

    case TILE_VIEW:
        return updateStateForAsyncAction(state, 'tileView', action);

    case VIDEO_MUTE:
        return updateStateForAsyncAction(state, 'videoMute', action);

    default:
        return state;
    }
};

/**
 * Abstracts the updating of state to store the status of an async request.
 *
 * @param {Object} state - The feature state to be updated.
 * @param {string} key - The key which should be updated in the feature state
 * with request data.
 * @param {Object} action - The update for an async action.
 * @private
 * @returns {Object}
 */
function updateStateForAsyncAction(state, key, action) {
    return {
        ...state,
        [key]: {
            requestState: action.requestState,
            expectedState: action.expectedState
        }
    };
}

export default remoteControlService;
