import { setSpotTVState } from './../spot-tv/actions';

import { remoteControlService } from 'common/remote-control';

import { REMOTE_CONTROL_REQUEST_STATE } from './actionTypes';
import { requestStates, requestTypes } from './constants';

/**
 * Updates the known request state of a command to a Spot-TV.
 *
 * @param {string} requestType - The type of the request to the Spot-TV.
 * @param {string} requestState - Whether the request is pending, completed, or
 * has ended with an error.
 * @param {*} expectedState - The desired state the command is trying to make
 * the Spot-TV change to.
 * @returns {Object}
 */
function setRequestState(requestType, requestState, expectedState) {
    return {
        type: REMOTE_CONTROL_REQUEST_STATE,
        requestType,
        requestState,
        expectedState
    };
}

/**
 * Sends a command to Spot-TV to change its audio mute setting.
 *
 * @param {boolean} mute - Whether to audio mute or audio unmute.
 * @returns {Function}
 */
export function setAudioMute(mute) {
    return dispatch => {
        dispatch(setRequestState(
            requestTypes.AUDIO_MUTE,
            requestStates.PENDING,
            mute
        ));

        return remoteControlService.setAudioMute(mute)
            .then(() => {
                dispatch(setSpotTVState({ audioMuted: mute }));
                dispatch(setRequestState(
                    requestTypes.AUDIO_MUTE,
                    requestStates.DONE,
                    mute
                ));
            })
            .catch(() => dispatch(setRequestState(
                requestTypes.AUDIO_MUTE, requestStates.ERROR)));
    };
}

/**
 * Sends a command to Spot-TV to change its video mute setting.
 *
 * @param {boolean} mute - Whether to video mute or video unmute.
 * @returns {Function}
 */
export function setVideoMute(mute) {
    return dispatch => {
        dispatch(setRequestState(
            requestTypes.VIDEO_MUTE,
            requestStates.PENDING,
            mute
        ));

        return remoteControlService.setVideoMute(mute)
            .then(() => {
                dispatch(setSpotTVState({ videoMuted: mute }));
                dispatch(setRequestState(
                    requestTypes.VIDEO_MUTE,
                    requestStates.DONE,
                    mute
                ));
            })
            .catch(() => dispatch(setRequestState(
                requestTypes.VIDEO_MUTE, requestStates.ERROR)));
    };
}
