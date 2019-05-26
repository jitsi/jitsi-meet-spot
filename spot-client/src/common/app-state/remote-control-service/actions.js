import { logger } from 'common/logger';
import { avUtils } from 'common/media';
import { createAsyncActionWithStates } from 'common/redux';
import { spotRemoteRemoteControlService } from 'common/remote-control';

import { setSpotTVState } from './../spot-tv/actions';

import {
    AUDIO_MUTE,
    DIAL_OUT,
    HANG_UP,
    JOIN_AD_HOC_MEETING,
    JOIN_SCHEDULED_MEETING,
    JOIN_WITH_SCREENSHARING,
    REMOTE_CONTROL_UPDATE_SCREENSHARE_STATE,
    SCREENSHARE,
    TILE_VIEW,
    VIDEO_MUTE
} from './actionTypes';

/**
 * Requests a Spot-TV to join a meeting with the screensharing turned on from the start.
 *
 * @param {string} meetingName - The meeting to join.
 * @param {string} screensharingType - Either 'wired' or 'wireless'.
 * @returns {Function}
 */
export function joinWithScreensharing(meetingName, screensharingType) {
    return dispatch => {
        spotRemoteRemoteControlService
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
        spotRemoteRemoteControlService.goToMeeting(meetingName);
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
        spotRemoteRemoteControlService.goToMeeting(meetingName);
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
        spotRemoteRemoteControlService.goToMeeting(meetingName, options);
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
        spotRemoteRemoteControlService.hangUp(skipFeedback);
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
    return dispatch => createAsyncActionWithStates(
        dispatch,
        () => spotRemoteRemoteControlService.setAudioMute(mute),
        AUDIO_MUTE,
        mute
    ).then(() => dispatch(setSpotTVState({ audioMuted: mute })));
}

/**
 * Sends a command to Spot-TV to change its layout to enter or exit tile view.
 *
 * @param {boolean} tileView - Whether to tile view should be displayed.
 * @returns {Function}
 */
export function setTileView(tileView) {
    return dispatch => createAsyncActionWithStates(
        dispatch,
        () => spotRemoteRemoteControlService.setTileView(tileView),
        TILE_VIEW,
        tileView
    ).then(() => dispatch(setSpotTVState({ tileView })));
}

/**
 * Sends a command to Spot-TV to change its video mute setting.
 *
 * @param {boolean} mute - Whether to video mute or video unmute.
 * @returns {Function}
 */
export function setVideoMute(mute) {
    return dispatch => createAsyncActionWithStates(
        dispatch,
        () => spotRemoteRemoteControlService.setVideoMute(mute),
        VIDEO_MUTE,
        mute
    ).then(() => dispatch(setSpotTVState({ videoMuted: mute })));
}

/**
 * Start wired screensharing.
 *
 * @returns {Function}
 */
export function startWiredScreensharing() {
    return dispatch => createAsyncActionWithStates(
        dispatch,
        () => spotRemoteRemoteControlService.setScreensharing(true),
        SCREENSHARE,
        'wired');
}

/**
 * Start wireless screensharing.
 *
 * @returns {Function}
 */
export function startWirelessScreensharing() {
    return dispatch => createAsyncActionWithStates(
        dispatch,
        () => spotRemoteRemoteControlService.setWirelessScreensharing(
            true,
            { onClose: () => dispatch(stopScreenshare()) }
        ),
        SCREENSHARE,
        'proxy'
    ).then(() => {
        dispatch(setLocalWirelessScreensharing(true));
        dispatch(setSpotTVState({ screensharingType: 'proxy' }));
    });
}

/**
 * Cleans ups any wireless screensharing connection being established or already
 * established.
 *
 * @returns {Function}
 */
export function forceStopWirelessScreenshare() {
    return dispatch => {
        spotRemoteRemoteControlService.destroyWirelessScreenshareConnections();

        dispatch(setLocalWirelessScreensharing(false));
    };
}

/**
 * Stops any screenshare in progress on the Spot-TV.
 *
 * @returns {Function}
 */
export function stopScreenshare() {
    return dispatch => createAsyncActionWithStates(
        dispatch,
        () => spotRemoteRemoteControlService.setScreensharing(false),
        SCREENSHARE,
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
