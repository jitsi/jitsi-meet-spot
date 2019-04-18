import { logger } from 'common/logger';
import { avUtils } from 'common/media';
import { remoteControlService } from 'common/remote-control';

import { setSpotTVState } from './../spot-tv/actions';

import {
    DIAL_OUT,
    HANG_UP,
    JOIN_AD_HOC_MEETING,
    JOIN_SCHEDULED_MEETING,
    JOIN_WITH_SCREENSHARING,
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

            return Promise.reject(error);
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
 * Requests a Spot to join a meeting with the screensharing turned on from the start.
 *
 * @param {string} meetingName - The meeting to join.
 * @param {string} screensharingType - Either 'wired' or 'wireless'.
 * @returns {Function}
 */
export function joinWithScreensharing(meetingName, screensharingType) {
    return dispatch => {
        remoteControlService
            .goToMeeting(
                meetingName,
                {
                    startWithScreensharing: screensharingType,
                    onClose: () => screensharingType === 'wireless' && dispatch(setLocalWirelessScreensharing(false))
                })
            .then(
                () => screensharingType === 'wireless' && dispatch(setLocalWirelessScreensharing(true)),
                error => {
                    const events = avUtils.getTrackErrorEvents();

                    if (error.name === events.CHROME_EXTENSION_USER_CANCELED) {
                        logger.log('onGoToMeeting with screensharing canceled by the user');
                    } else {
                        logger.error('onGoToMeeting with screensharing rejected', { error });
                    }

                    screensharingType === 'wireless' && dispatch(setLocalWirelessScreensharing(false));
                });
        dispatch({
            type: JOIN_WITH_SCREENSHARING,
            meetingName,
            screensharingType
        });
    };
}

/**
 * Requests a Spot to join a scheduled meeting.
 *
 * @param {string} meetingName - The meeting to join.
 * @returns {Function}
 */
export function joinScheduledMeeting(meetingName) {
    return dispatch => {
        remoteControlService.goToMeeting(meetingName);
        dispatch({
            type: JOIN_SCHEDULED_MEETING,
            meetingName
        });
    };
}

/**
 * Requests a Spot to join a ad hoc meeting.
 *
 * @param {string} meetingName - The meeting to join.
 * @returns {Function}
 */
export function joinAdHocMeeting(meetingName) {
    return dispatch => {
        remoteControlService.goToMeeting(meetingName);
        dispatch({
            type: JOIN_AD_HOC_MEETING,
            meetingName
        });
    };
}

/**
 * Requests a Spot to join a meeting by dialing out a specified phone number.
 *
 * @param {string} meetingName - The meeting name that will be used for the call.
 * @param {string} phoneNumber - The phone number to dialed into the meeting.
 * @returns {Function}
 */
export function dialOut(meetingName, phoneNumber) {
    const options = {
        invites: [
            {
                type: 'phone', // jitsi-meet expects type phone
                number: phoneNumber
            }
        ]
    };

    return dispatch => {
        remoteControlService.goToMeeting(meetingName, options);
        dispatch({
            type: DIAL_OUT,
            meetingName,
            phoneNumber
        });
    };
}

/**
 * Exits any meeting in progress.
 *
 * @param {boolean} skipFeedback - Whether or not to immediately leave the
 * meeting without prompting for meeting feedback.
 * @returns {Function}
 */
export function hangUp(skipFeedback) {
    return dispatch => {
        remoteControlService.hangUp(skipFeedback);
        dispatch({
            type: HANG_UP,
            skipFeedback
        });
    };
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
