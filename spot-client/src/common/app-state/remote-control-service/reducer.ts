import {
    AUDIO_MUTE,
    CREATE_CONNECTION,
    DESTROY_CONNECTION,
    JOIN_WITH_SCREENSHARING,
    RECONNECTION_SCHEDULE_UPDATED,
    REMOTE_CONTROL_UPDATE_SCREENSHARE_STATE,
    SCREENSHARE,
    TILE_VIEW,
    VIDEO_MUTE,
    WHITEBOARD
} from './actionTypes';

export interface IRemoteControlServiceState {
    audioMute?: any;
    connect?: any;
    handRaised?: any;
    isReconnectScheduled?: boolean;
    isWirelessScreensharing: boolean;
    joinWithScreensharing?: any;
    screenshare?: any;
    tileView?: any;
    videoMute?: any;
    whiteboard?: any;
}

const DEFAULT_STATE: IRemoteControlServiceState = {
    isWirelessScreensharing: false
};

/**
 * A {@code Reducer} to update the current Redux state for the
 * 'remoteControlService' feature.
 *
 * @param state - The current Redux state for the 'setup' feature.
 * @param action - The Redux state update payload.
 * @returns
 */
const remoteControlService = (
        state: IRemoteControlServiceState = DEFAULT_STATE,
        action: any
): IRemoteControlServiceState => {
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

    case WHITEBOARD:
        return updateStateForAsyncAction(state, 'whiteboard', action);

    default:
        return state;
    }
};

/**
 * Abstracts the updating of state to store the status of an async request.
 *
 * @param state - The feature state to be updated.
 * @param key - The key which should be updated in the feature state
 * with request data.
 * @param action - The update for an async action.
 * @private
 * @returns
 */
function updateStateForAsyncAction(
        state: IRemoteControlServiceState,
        key: keyof IRemoteControlServiceState,
        action: any
): IRemoteControlServiceState {
    return {
        ...state,
        [key]: {
            requestState: action.requestState,
            expectedState: action.expectedState
        }
    };
}

export default remoteControlService;
