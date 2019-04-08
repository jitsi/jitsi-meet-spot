import { setSpotTVState } from './../spot-tv/actions';

import { remoteControlService } from 'common/remote-control';

import {
    REMOTE_CONTROL_REQUEST_STATE,
    REMOTE_CONTROL_UPDATE_SCREENSHARE_STATE
} from './actionTypes';
import { requestStates, requestTypes } from './constants';

/**
 * Requests a Spot to join a meeting.
 *
 * @param {string} meetingName - The meeting to join.
 * @param {GoToMeetingOptions} options - Additional details about how to join the
 * meeting.
 * @returns {Function}
 */
export function goToMeeting(meetingName, options) {
    return () => remoteControlService.goToMeeting(meetingName, options);
}

/**
 * Exits any meeting in progress.
 *
 * @param {boolean} skipFeedback - Whether or not to immediately leave the
 * meeting without prompting for meeting feedback.
 * @returns {Function}
 */
export function hangUp(skipFeedback) {
    return () => remoteControlService.hangUp(skipFeedback);
}

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

/**
 * Start wireless screensharing.
 *
 * @returns {Function}
 */
export function startWirelessScreensharing() {
    return dispatch => {
        dispatch(setRequestState(
            requestTypes.SCREENSHARE,
            requestStates.PENDING,
            'proxy'
        ));

        return remoteControlService.setWirelessScreensharing(
            true,
            { onClose: () => dispatch(stopScreenshare()) }
        ).then(() => {
            dispatch(setLocalWirelessScreensharing(true));
            dispatch(setSpotTVState({ screensharingType: 'proxy' }));
            dispatch(setRequestState(
                requestTypes.SCREENSHARE,
                requestStates.DONE,
                'proxy'
            ));
        })
        .catch(() => dispatch(setRequestState(
            requestTypes.SCREENSHARE, requestStates.ERROR)));
    };
}

/**
 * Stops any screenshare in progress on the Spot-TV.
 *
 * @returns {Function}
 */
export function stopScreenshare() {
    return dispatch => remoteControlService.setScreensharing(false)
        .then(() => {
            dispatch(setLocalWirelessScreensharing(false));
            dispatch(setSpotTVState({ screensharingType: undefined }));
        });
}

/**
 * Updates the Redux store on whether or not the current Spot-Remote is
 * currently screensharing wirelessly.
 *
 * @param {boolean} isSharing - Wheteher or not local wireless screenshare is
 * active.
 * @returns {Object}
 */
export function setLocalWirelessScreensharing(isSharing) {
    return {
        type: REMOTE_CONTROL_UPDATE_SCREENSHARE_STATE,
        isSharing
    };
}
