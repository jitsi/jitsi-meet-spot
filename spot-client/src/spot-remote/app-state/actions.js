import {
    CREATE_CONNECTION,
    PASSWORD,
    addNotification,
    clearSpotTVState,
    destroyConnection,
    getRemoteControlServerConfig,
    getSpotServicesConfig,
    isP2PSignalingEnabled,
    setCalendarEvents,
    setSpotTVState
} from 'common/app-state';
import { setSpotInstanceInfo } from 'common/app-state/device-id';
import { createAsyncActionWithStates } from 'common/async-actions';
import {
    getPermanentPairingCode,
    isBackendEnabled,
    setPermanentPairingCode,
    SpotBackendService
} from 'common/backend';
import { history } from 'common/history';
import { logger } from 'common/logger';
import {
    CONNECTION_EVENTS,
    SERVICE_UPDATES,
    remoteControlClient
} from 'common/remote-control';
import { ROUTES } from 'common/routing';
import { getJitterDelay, windowHandler } from 'common/utils';

import {
    SPOT_REMOTE_API_JOIN_CODE_RECEIVED,
    SPOT_REMOTE_COMPLETED_ONBOARDING,
    SPOT_REMOTE_EXIT_SHARE_MODE,
    SPOT_REMOTE_JOIN_CODE_INVALID,
    SPOT_REMOTE_JOIN_CODE_VALID, SPOT_REMOTE_SET_COUNTRY_CODE,
    SPOT_REMOTE_WILL_VALIDATE_JOIN_CODE
} from './actionTypes';

/**
 * Presence attributes from Spot-TV to store in redux.
 *
 * @type {Array}
 */
const presenceToStore = [
    'audioMuted',
    'electron',
    'inMeeting',
    'kicked',
    'needPassword',
    'remoteJoinCode',
    'roomName',
    'screensharing',
    'screensharingType',
    'spotId',
    'tenant',
    'tileView',
    'videoMuted',
    'view',
    'wiredScreensharingEnabled'
];

/**
 * An array which stores all listeners bound to the the remote control service.
 *
 * @type {Array<Function>}
 */
let rcsListeners = [];

/**
 * Connects Spot Remote to Spot TV.
 *
 * @param {string} joinCode - The join code to be used by Spot Remote in order to be paired with a Spot TV.
 * @param {boolean} shareMode - Indicates whether the Spot Remote is running in the special screen share mode or not.
 * @returns {Function}
 */
export function connectToSpotTV(joinCode, shareMode) {
    return (dispatch, getState) => {
        if (remoteControlClient.getConnectPromise()) {
            throw new Error('Spot Remote XMPP connection is still alive');
        }

        dispatch({
            type: SPOT_REMOTE_WILL_VALIDATE_JOIN_CODE,
            joinCode,
            shareMode
        });

        const state = getState();
        const backend
            = isBackendEnabled(state)
                ? new SpotBackendService(getSpotServicesConfig(state))
                : null;
        const enableP2PSignaling = isP2PSignalingEnabled(state);
        const serverConfig = getRemoteControlServerConfig(state);

        /**
         * The things done after successful connect.
         *
         * @param {RoomProfile} roomProfile - Information about the room to which the Spot Remote has been connected to.
         * @returns {void}
         */
        function onSuccessfulConnect(roomProfile) {
            dispatch({
                type: SPOT_REMOTE_JOIN_CODE_VALID,
                joinCode,
                shareMode
            });

            if (backend && backend.isPairingPermanent()) {
                logger.log('This remote will be paired permanently');
                dispatch(setPermanentPairingCode(joinCode));
            } else {
                dispatch(setPermanentPairingCode(''));
            }

            const countryCode = roomProfile && roomProfile.countryCode;

            dispatch({
                type: SPOT_REMOTE_SET_COUNTRY_CODE,
                countryCode
            });

            const roomId = roomProfile && roomProfile.id;

            roomId && dispatch(setSpotInstanceInfo({
                roomId,
                isSpotTv: false,
                isPairingPermanent: backend && backend.isPairingPermanent()
            }));
        }

        /**
         * Things done when the connect attempt fails.
         *
         * @param {Error|string} error - What went wrong.
         * @returns {Promise}
         */
        function onDisconnect(error) {
            logger.error('On Spot Remote disconnect', { error });

            dispatch(destroyConnection());
            dispatch(clearSpotTVState());

            // Retry for permanent pairing as long as the backend accepts the code
            if (getPermanentPairingCode(getState())
                && !remoteControlClient.isUnrecoverableRequestError(error)) {
                const jitter = getJitterDelay(3);

                logger.log(`Spot Remote will try to reconnect after ${jitter}ms`);

                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        doConnect().then(resolve, reject);
                    }, jitter);
                });
            }

            dispatch(setPermanentPairingCode(''));

            dispatch({
                type: SPOT_REMOTE_JOIN_CODE_INVALID,
                joinCode,
                shareMode
            });

            _clearSubscriptions();

            dispatch(clearSpotTVState());

            history.push(ROUTES.CODE);

            // Assumption alert: CLOSED_BY_SERVER can only happen when a
            // temporary remote has been removed from the muc at the end of a
            // meeting by Spot-TV.
            if (error === CONNECTION_EVENTS.CLOSED_BY_SERVER) {
                dispatch(addNotification(
                    'message',
                    'The meeting has ended.'
                ));
            }

            throw error;
        }

        /**
         * Starts the connection and hooks up success/failure handlers.
         *
         * @private
         * @returns {Promise}
         */
        function doConnect() {
            logger.log('Spot Remote attempting connection');

            return createAsyncActionWithStates(
                dispatch,
                () => remoteControlClient.connect({
                    joinCode,
                    backend,
                    enableP2PSignaling,
                    serverConfig
                }),
                CREATE_CONNECTION
            ).then(onSuccessfulConnect)
                .catch(onDisconnect);
        }

        const store = {
            dispatch,
            getState
        };

        rcsListeners.push(
            remoteControlClient.addListener(
                SERVICE_UPDATES.SERVER_STATE_CHANGE,
                _onSpotTVStateChange.bind(null, store)));

        rcsListeners.push(
            remoteControlClient.addListener(
                SERVICE_UPDATES.UNRECOVERABLE_DISCONNECT,
                onDisconnect));

        return doConnect();
    };
}

/**
 * Notifies the app that a join code is received through the external api.
 *
 * @param {string} joinCode - The join code recived.
 * @returns {Object}
 */
export function setAPiReceivedJoinCode(joinCode) {
    return {
        type: SPOT_REMOTE_API_JOIN_CODE_RECEIVED,
        joinCode
    };
}

/**
 * Removes listeners set on the remote control service.
 *
 * @private
 * @returns {void}
 */
function _clearSubscriptions() {
    for (const removeListener of rcsListeners) {
        removeListener();
    }
    rcsListeners = [];
}

/**
 * Callback invoked when {@code remoteControlClient} has an update about the current state of
 * a Spot-TV.
 *
 * @param {Object} store - The Redux store.
 * @param {Object} data - Details of the Spot-TV's current state.
 * @private
 * @returns {void}
 */
function _onSpotTVStateChange({ dispatch }, data) {
    const newState = {};
    const { updatedState } = data;

    for (const presenceKey of presenceToStore) {
        newState[presenceKey] = updatedState[presenceKey];
    }

    dispatch(setSpotTVState(newState));

    if (Array.isArray(updatedState.calendar)) {
        const events = updatedState.calendar;

        dispatch(setCalendarEvents(events));
    }
}

/**
 * Stops any connection to a Spot-TV and clears redux state about the Spot-TV.
 *
 * @returns {Function}
 */
export function disconnectFromSpotTV() {
    return dispatch => {
        _clearSubscriptions();

        remoteControlClient.disconnect();

        dispatch(setCalendarEvents([]));
        dispatch(clearSpotTVState());
    };
}

/**
 * Exits the special share mode.
 *
 * @returns {Function}
 */
export function exitShareMode() {
    return dispatch => {
        dispatch({
            type: SPOT_REMOTE_EXIT_SHARE_MODE
        });

        history.push(ROUTES.REMOTE_CONTROL);
    };
}

/**
 * Notifies that the new user onboarding has been completed.
 *
 * @returns {Object}
 */
export function setHasCompletedOnboarding() {
    return {
        type: SPOT_REMOTE_COMPLETED_ONBOARDING
    };
}

/**
 * Enters a password to be used to join a meeting.
 *
 * @param {string} password - The meeting password to use.
 * @returns {Function}
 */
export function submitPassword(password) {
    return dispatch => createAsyncActionWithStates(
        dispatch,
        () => remoteControlClient.submitPassword(password),
        PASSWORD,
        password
    ).then(() => dispatch(setSpotTVState({ needPassword: false })));
}

/**
 * Callback invoked when the remote control client has recovered from a reload
 * and the remote control should reload itself.
 *
 * @param {string} remoteJoinCode - The Spot-TV join code that should be used
 * after reloading the page.
 * @private
 * @returns {void}
 */
export function updateSpotRemoteSource() {
    return () => remoteControlClient.disconnect()
        .then(() => windowHandler.reload());
}

