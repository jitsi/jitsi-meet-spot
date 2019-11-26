import {
    SPOT_TV_CLEAR_STATE,
    SPOT_TV_SET_REMOTE_JOIN_CODE,
    SPOT_TV_SET_STATE
} from './action-types';

const DEFAULT_STATE = {
    audioMuted: true,
    electron: false,
    inMeeting: undefined,
    kicked: false,
    meetingType: undefined,
    needPassword: false,
    remoteJoinCode: undefined,
    roomName: undefined,
    screensharing: false,
    screensharingType: undefined,
    spotId: undefined,
    tileView: false,
    videoMuted: true,
    view: undefined

    // FIXME: setting the default prevents wired screensharing from being
    // set to true.
    // wiredScreensharingEnabled: false
};

/**
* A {@code Reducer} to update the current Redux state for the 'spotTv feature.
* The 'spotTV' features holds the app state related of a Spot-TV that instances
* of Spot-Remotes should know about.
*
* @param {Object} state - The current Redux state for the 'setup' feature.
* @param {Object} action - The Redux state update payload.
* @returns {Object}
*/
const spotTv = (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case SPOT_TV_CLEAR_STATE:
        return DEFAULT_STATE;

    // FIXME: remove the redundancy with SPOT_TV_SET_STATE.
    case SPOT_TV_SET_REMOTE_JOIN_CODE:
        return {
            ...state,
            remoteJoinCode: action.remoteJoinCode
        };

    case SPOT_TV_SET_STATE:
        return {
            ...state,
            ...action.newState
        };

    default:
        return state;
    }
};

export default spotTv;
