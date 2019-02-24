import {
    REMOTE_CONTROL_SET_JOIN_CODE,
    REMOTE_CONTROL_SET_LOCK,
    REMOTE_CONTROL_SET_MEETING,
    REMOTE_CONTROL_SET_ROOM_NAME,
    REMOTE_CONTROL_SET_SPOT_STATE,
    REMOTE_CONTROL_SPOT_LEFT
} from './action-types';

const DEFAULT_STATE = {
    audioMuted: true,
    inMeeting: '',
    isWirelessScreenshareConnectionActive: false,
    localId: null,
    lock: null,
    meetingApi: null,
    remoteId: null,
    screensharing: false,
    spotId: null,
    videoMuted: true
};

/**
 * A {@code Reducer} to update the current Redux state for the 'remoteControl'
 * feature. The 'remoteControl' feature stores information necessary for
 * remote controllers to connect and control a Spot instance.
 *
 * @param {Object} state - The current Redux state for the 'setup' feature.
 * @param {Object} action - The Redux state update payload.
 * @returns {Object}
 */
const remoteControl = (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case REMOTE_CONTROL_SET_JOIN_CODE:
        return {
            ...state,
            joinCode: action.joinCode
        };

    case REMOTE_CONTROL_SET_LOCK:
        return {
            ...state,
            lock: action.lock
        };

    case REMOTE_CONTROL_SET_MEETING:
        return {
            ...state,
            meetingApi: action.meetingApi
        };

    case REMOTE_CONTROL_SET_ROOM_NAME:
        return {
            ...state,
            roomName: action.roomName
        };

    case REMOTE_CONTROL_SET_SPOT_STATE:
        return {
            ...state,
            ...action.state
        };

    case REMOTE_CONTROL_SPOT_LEFT:
        return DEFAULT_STATE;

    default:
        return state;
    }
};

export default remoteControl;
