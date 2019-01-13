const DEFAULT_STATE = {
    audioMuted: true,
    localId: null,
    lock: null,
    meetingApi: null,
    remoteId: null,
    screensharing: false,
    videoMuted: true
};

export const REMOTE_CONTROL_SET_LOCK = 'REMOTE_CONTROL_SET_LOCK';
export const REMOTE_CONTROL_SET_MEETING = 'REMOTE_CONTROL_SET_MEETING';
export const REMOTE_CONTROL_SET_SPOT_STATE = 'REMOTE_CONTROL_SET_SPOT_STATE';

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
    case REMOTE_CONTROL_SET_LOCK:
        return {
            ...state,
            lock: action.lock
        };

    case REMOTE_CONTROL_SET_MEETING: {
        const inMeetingStateReset = action.meetingApi ? {} : {
            audioMuted: true,
            screensharing: false,
            videoMuted: true
        };

        return {
            ...state,
            ...inMeetingStateReset,
            meetingApi: action.meetingApi
        };
    }

    case REMOTE_CONTROL_SET_SPOT_STATE:
        return {
            ...state,
            ...action.state
        };

    default:
        return state;
    }
};

/**
 * A selector which returns the last known lock code for establishing a remote
 * control connection.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getCurrentLock(state) {
    return state.remoteControl.lock;
}

/**
 * A selector which returns the current view that is being displayed on Spot.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getCurrentView(state) {
    return state.remoteControl.view;
}

/**
 * A selector which returns the current status of various meeting features.
 *
 * @param {Object} state - The Redux state.
 * @returns {Object}
 */
export function getInMeetingStatus(state) {
    return {
        audioMuted: state.remoteControl.audioMuted,
        screensharing: state.remoteControl.screensharing,
        videoMuted: state.remoteControl.videoMuted
    };
}

/**
 * A selector which returns the api (a delegate which is an instance of
 * {@code JitsiMeetExternalAPI}) that can be used to directly
 * manipulate the meeting.
 *
 * @param {Object} state - The Redux state.
 * @returns {Object|null}
 */
export function getMeetingApi(state) {
    return state.remoteControl.meetingApi;
}

/**
 * A selector which returns an id to be used by Spot and remote controls to
 * identify each other through the remote control service.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getLocalRemoteControlId(state) {
    return state.remoteControl.localId;
}

export default remoteControl;
