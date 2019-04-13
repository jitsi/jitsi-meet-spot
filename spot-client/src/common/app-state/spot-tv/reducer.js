import {
    SPOT_TV_CLEAR_STATE,
    SPOT_TV_SET_JOIN_CODE,
    SPOT_TV_SET_STATE
} from './action-types';

const DEFAULT_STATE = {
    audioMuted: true,
    inMeeting: undefined,
    joinCode: undefined,
    screensharingType: undefined,
    spotId: null,
    videoMuted: true,
    view: null

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

    case SPOT_TV_SET_JOIN_CODE:
        return {
            ...state,
            joinCode: action.joinCode
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
