import { registerDevice } from 'common/backend';
import { logger } from 'common/logger';
import { avUtils } from 'common/media';
import { createAsyncActionWithStates } from 'common/redux';
import { SERVICE_UPDATES, remoteControlService } from 'common/remote-control';
import { generateRandomString } from 'common/utils';
import {
    getJoinCodeRefreshRate,
    getRemoteControlServerConfig,
    getSpotServicesConfig
} from './../config/selectors';
import { setJwt } from './../setup/actions';
import { setJoinCode, setSpotTVState } from './../spot-tv/actions';

import {
    AUDIO_MUTE,
    CREATE_CONNECTION,
    DIAL_OUT,
    HANG_UP,
    JOIN_AD_HOC_MEETING,
    JOIN_SCHEDULED_MEETING,
    JOIN_WITH_SCREENSHARING,
    REMOTE_CONTROL_UPDATE_SCREENSHARE_STATE,
    SCREENSHARE,
    VIDEO_MUTE
} from './actionTypes';


/**
 * Establishes a connection to an existing Spot-MUC using the provided join code.
 *
 * @returns {Object}
 */
export function createSpotTVRemoteControlConnection() {
    return (dispatch, getState) => {
        /**
         * Callback invoked when a connect has been successfully made with
         * {@code remoteControlService}.
         *
         * @param {Object} result - Includes information specific about the
         * connection.
         * @returns {void}
         */
        function onSuccessfulConnect({ joinCode, jwt }) {
            dispatch(setJoinCode(joinCode));
            dispatch(setJwt(jwt));
        }

        /**
         * Callback invoked when {@code remoteControlService} has been
         * disconnected from an unrecoverable error. Tries to reconnect.
         *
         * @private
         * @returns {void}
         */
        function onDisconnect() {
            logger.error(
                'Spot-TV disconnected from the remote control service.');
            remoteControlService.disconnect()
                .then(() => {
                    dispatch(setJoinCode(''));

                    doConnect();
                });
        }

        /**
         * Callback invoked when {@code remoteControlService} has changed the
         * join code necessary to pair with the Spot-TV.
         *
         * @param {Object} data - An object containing the update.
         * @private
         * @returns {void}
         */
        function onJoinCodeChange(data) {
            dispatch(setJoinCode(data.joinCode));
        }

        /**
         * Encapsulates connection logic with updating states.
         *
         * @private
         * @returns {Promise}
         */
        function doConnect() {
            return createAsyncActionWithStates(
                dispatch,
                () => createConnection(getState()),
                CREATE_CONNECTION
            ).then(onSuccessfulConnect)
            .catch(onDisconnect);
        }

        remoteControlService.addListener(
            SERVICE_UPDATES.UNRECOVERABLE_DISCONNECT,
            onDisconnect
        );
        remoteControlService.addListener(
            SERVICE_UPDATES.JOIN_CODE_CHANGE,
            onJoinCodeChange
        );

        return doConnect();
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
    return dispatch => createAsyncActionWithStates(
        dispatch,
        () => remoteControlService.setAudioMute(mute),
        AUDIO_MUTE,
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
    return dispatch => createAsyncActionWithStates(
        dispatch,
        () => remoteControlService.setVideoMute(mute),
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
        () => remoteControlService.setScreensharing(true),
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
        () => remoteControlService.setWirelessScreensharing(
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
 * Stops any screenshare in progress on the Spot-TV.
 *
 * @returns {Function}
 */
export function stopScreenshare() {
    return dispatch => createAsyncActionWithStates(
        dispatch,
        () => remoteControlService.setScreensharing(false),
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

/**
 * Interacts with the {@code remoteControlService} to create a connection to be
 * consumed by a Spot-TV client.
 *
 * @param {Object} state - The Redux state.
 * @returns {Promise<Object>} Resolves with an object containing the latest
 * join code and jwt.
 */
function createConnection(state) {
    const {
        adminServiceUrl,
        joinCodeServiceUrl
    } = getSpotServicesConfig(state);
    const joinCodeRefreshRate = getJoinCodeRefreshRate(state);
    const remoteControlConfiguration = getRemoteControlServerConfig(state);

    let finalJoinCode, finalJwt;

    // FIXME 'registerDevice' should be retried forever because abstract loader
    // no longer does that
    const getJoinCodePromise = adminServiceUrl
        ? registerDevice(adminServiceUrl)
            .then(json => {
                const { joinCode, jwt } = json;

                finalJwt = jwt;

                return joinCode;
            })
        : Promise.resolve();

    logger.log('Attempting connection', { adminServiceUrl });

    return getJoinCodePromise
        .then(joinCode => {
            logger.log('Setting up the Spot TV url', { joinCode });
            finalJoinCode = joinCode;

            let getRoomInfoPromise;

            if (joinCodeServiceUrl) {
                getRoomInfoPromise = remoteControlService.exchangeCode(
                    joinCode,
                    {
                        joinCodeServiceUrl
                    }
                );
            } else {
                getRoomInfoPromise = Promise.resolve({
                    // If there's no joinCode service then create a room and let the lock
                    // be set later. Setting the lock on join will throw an error about
                    // not being authorized..
                    roomName: generateRandomString(3)
                });
            }

            return getRoomInfoPromise;
        })
        .then(roomInfo => remoteControlService.connect({
            autoReconnect: true,
            joinAsSpot: true,

            // FIXME join code refresh is disabled with the backend as the first step,
            // because there's no password set on the room and the JWT is used instead.
            joinCodeRefreshRate: !adminServiceUrl && joinCodeRefreshRate,
            roomInfo,
            serverConfig: remoteControlConfiguration
        }))
        .then(() => {
            return {
                joinCode: finalJoinCode,
                jwt: finalJwt
            };
        });
}
