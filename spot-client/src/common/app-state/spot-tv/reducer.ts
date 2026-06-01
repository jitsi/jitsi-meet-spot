import {
    SPOT_TV_CLEAR_STATE,
    SPOT_TV_SET_REMOTE_JOIN_CODE,
    SPOT_TV_SET_STATE
} from './action-types';

export interface ISpotTvState {
    audioMuted: boolean;
    electron: boolean;
    inMeeting?: any;
    kicked: boolean;
    needPassword: boolean;
    remoteJoinCode?: string;
    roomName?: string;
    screensharing: boolean;
    screensharingType?: any;
    spotId?: string;
    tileView: boolean;
    videoMuted: boolean;
    view?: any;
    volumeControlSupported: boolean;
    waitingForMeetingStart: boolean;
    wiredScreensharingEnabled?: boolean;
    [key: string]: any;
}

const DEFAULT_STATE: ISpotTvState = {
    audioMuted: true,
    electron: false,
    inMeeting: undefined,
    kicked: false,
    needPassword: false,
    remoteJoinCode: undefined,
    roomName: undefined,
    screensharing: false,
    screensharingType: undefined,
    spotId: undefined,
    tileView: false,
    videoMuted: true,
    view: undefined,
    volumeControlSupported: false,
    waitingForMeetingStart: false

    // FIXME: setting the default prevents wired screensharing from being
    // set to true.
    // wiredScreensharingEnabled: false
};

/**
* A {@code Reducer} to update the current Redux state for the 'spotTv feature.
* The 'spotTV' features holds the app state related of a Spot-TV that instances
* of Spot-Remotes should know about.
*
* @param state - The current Redux state for the 'setup' feature.
* @param action - The Redux state update payload.
* @returns
*/
const spotTv = (state: ISpotTvState = DEFAULT_STATE, action: any): ISpotTvState => {
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
