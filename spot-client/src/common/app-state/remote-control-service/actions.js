import { createAsyncActionWithStates } from 'common/async-actions';
import { logger } from 'common/logger';
import { remoteControlClient } from 'common/remote-control';

import { setSpotTVState } from './../spot-tv/actions';
import {
    AUDIO_MUTE,
    DESTROY_CONNECTION,
    DIAL_OUT,
    HANG_UP,
    JOIN_AD_HOC_MEETING,
    JOIN_SCHEDULED_MEETING,
    JOIN_WITH_SCREENSHARING,
    RAISE_HAND,
    RECONNECTION_SCHEDULE_UPDATED,
    REMOTE_CONTROL_UPDATE_SCREENSHARE_STATE,
    SCREENSHARE,
    TILE_VIEW,
    VIDEO_MUTE
} from './actionTypes';

/**
 * Clears any state associated with the 'connect' async action.
 * See {@link CREATE_CONNECTION} in action types and it's usage.
 *
 * @returns {Object}
 */
export function destroyConnection() {
    return {
        type: DESTROY_CONNECTION
    };
}

/**
 * Requests a Spot-TV to join a meeting with the screensharing turned on from the start.
 *
 * @param {string} meetingName - The meeting to join.
 * @param {string} screensharingType - Either 'wired' or 'wireless'.
 * @returns {Function}
 */
export function joinWithScreensharing(meetingName, screensharingType) {
    return dispatch => {
        remoteControlClient
            .goToMeeting(
                meetingName,
                {
                    startWithScreensharing: screensharingType,
                    onClose: () => screensharingType === 'wireless' && dispatch(setLocalWirelessScreensharing(false))
                })
            .then(
                () => screensharingType === 'wireless' && dispatch(setLocalWirelessScreensharing(true)),
                error => {
                    logger.error('onGoToMeeting with screensharing rejected', { error });
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
 * @param {string} meetingName - The Jitsi meeting to join.
 * @param {string} meetingDisplayName - An alternative display name for the
 * meeting, such as the event name on a calendar.
 * @returns {Function}
 */
export function joinScheduledMeeting(meetingName, meetingDisplayName) {
    return dispatch => createAsyncActionWithStates(
        dispatch,
        () => remoteControlClient.goToMeeting(meetingName, { meetingDisplayName }),
        JOIN_SCHEDULED_MEETING,
        meetingName
    );
}

/**
 * Requests a Spot to join a ad hoc meeting.
 *
 * @param {string} meetingName - The meeting to join.
 * @returns {Function}
 */
export function joinAdHocMeeting(meetingName) {
    return dispatch => createAsyncActionWithStates(
        dispatch,
        () => remoteControlClient.goToMeeting(meetingName),
        JOIN_AD_HOC_MEETING,
        meetingName
    );
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
        ],
        startWithVideoMuted: true
    };

    return dispatch => {
        remoteControlClient.goToMeeting(meetingName, options);
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
 * @param {boolean} onlyIfLonelyCall - If true, hangup will occur only if there
 * are no remote participants in the call.
 * @returns {Function}
 */
export function hangUp(skipFeedback = false, onlyIfLonelyCall = false) {
    return dispatch => {
        remoteControlClient.hangUp({
            onlyIfLonelyCall,
            skipFeedback
        });
        dispatch({
            type: HANG_UP,
            onlyIfLonelyCall,
            skipFeedback
        });
    };
}

/**
 * Stores whether or not a reconnect is queued.
 *
 * @param {boolean} isReconnectScheduled - Whether or not a reconnect will
 * happen soon.
 * @returns {Object}
 */
export function reconnectScheduleUpdate(isReconnectScheduled) {
    return {
        type: RECONNECTION_SCHEDULE_UPDATED,
        isReconnectScheduled
    };
}

/**
 * Sends a command to Spot-TV to play the passed in touch tones.
 *
 * @param {string} tones - The tones to play.
 * @returns {Function}
 */
export function sendTouchTones(tones) {
    return () => remoteControlClient.sendTouchTones(tones);
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
        () => remoteControlClient.setAudioMute(mute),
        AUDIO_MUTE,
        mute
    ).then(() => dispatch(setSpotTVState({ audioMuted: mute })));
}

/**
 * Sends a command to Spot-TV to change its hand raised setting.
 *
 * @param {boolean} handRaised - Whether to raise or lower the hand.
 * @returns {Function}
 */
export function setRaiseHand(handRaised) {
    return dispatch => createAsyncActionWithStates(
        dispatch,
        () => remoteControlClient.setRaiseHand(handRaised),
        RAISE_HAND,
        handRaised
    ).then(() => dispatch(setSpotTVState({ handRaised })));
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
        () => remoteControlClient.setTileView(tileView),
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
        () => remoteControlClient.setVideoMute(mute),
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
        () => remoteControlClient.setScreensharing(true),
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
        () => remoteControlClient.setWirelessScreensharing(
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
        remoteControlClient.destroyWirelessScreenshareConnections();

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
        () => remoteControlClient.setScreensharing(false),
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
