import { logger } from 'common/logger';
import { remoteControlService } from 'common/remote-control';

import { setSpotTVState } from './../spot-tv/actions';

import {
    REMOTE_CONTROL_REQUEST_STATE,
    REMOTE_CONTROL_UPDATE_SCREENSHARE_STATE
} from './actionTypes';
import { requestStates, requestTypes } from './constants';

/**
 * Encapsulates updating the known status of a command in flight to a Spot-TV
 * for a state change.
 *
 * @param {Function} dispatch - The Redux dispatch function to update the
 * current state of a request in flight.
 * @param {Function} request - The function which should be executed that
 * performs the async request. The function must return a promise.
 * @param {Function} requestType - The type of the request. Used to reference
 * the request in Redux.
 * @param {Function} expectedValue - What the expected result of the request
 * should be. Used for optimistic updating of the UI.
 * @private
 * @returns {Function<Promise>}
 */
function createActionWithRequestStates( // eslint-disable-line max-params
        dispatch,
        request,
        requestType,
        expectedValue) {
    dispatch(setRequestState(
        requestType,
        requestStates.PENDING,
        expectedValue
    ));

    return request()
        .then(() => dispatch(setRequestState(
            requestType,
            requestStates.DONE,
            expectedValue
        )), error => {
            logger.error('Encountered error commanding Spot-TV', {
                error,
                expectedValue,
                requestType
            });

            dispatch(setRequestState(requestType, requestStates.ERROR));
        });
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
 * Sends a command to Spot-TV to change its audio mute setting.
 *
 * @param {boolean} mute - Whether to audio mute or audio unmute.
 * @returns {Function}
 */
export function setAudioMute(mute) {
    return dispatch => createActionWithRequestStates(
        dispatch,
        () => remoteControlService.setAudioMute(mute),
        requestTypes.AUDIO_MUTE,
        mute
    ).then(() => dispatch(setSpotTVState({ audioMuted: mute })));
}

/**
 * Sends a command to Spot-TV to change its video mute setting.
 *
 * @param {boolean} mute - Whether to video mute or video unmute.
 * @returns {Function}
 */
export function setVideoMute(mute) {
    return dispatch => createActionWithRequestStates(
        dispatch,
        () => remoteControlService.setVideoMute(mute),
        requestTypes.VIDEO_MUTE,
        mute
    ).then(() => dispatch(setSpotTVState({ videoMuted: mute })));
}

/**
 * Start wireless screensharing.
 *
 * @returns {Function}
 */
export function startWirelessScreensharing() {
    return dispatch => createActionWithRequestStates(
        dispatch,
        () => remoteControlService.setWirelessScreensharing(
            true,
            { onClose: () => dispatch(stopScreenshare()) }
        ),
        requestTypes.SCREENSHARE,
        'proxy'
    ).then(() => {
        dispatch(setLocalWirelessScreensharing(true));
        dispatch(setSpotTVState({ screensharingType: 'proxy' }));
    });
}

/**
 * Stops any screenshare in progress on the Spot-TV.
 *
 * @returns {Function}
 */
export function stopScreenshare() {
    return dispatch => createActionWithRequestStates(
        dispatch,
        () => remoteControlService.setScreensharing(false),
        requestTypes.SCREENSHARE,
        undefined
    ).then(() => {
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
