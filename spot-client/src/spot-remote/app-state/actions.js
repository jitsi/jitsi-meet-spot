import {
    PASSWORD,
    clearSpotTVState,
    getRemoteControlServerConfig,
    getSpotServicesConfig,
    setCalendarEvents,
    setReconnectState,
    setSpotTVState
} from 'common/app-state';
import {
    isBackendEnabled,
    isUnrecoverableError,
    SpotBackendService
} from 'common/backend';
import { history } from 'common/history';
import { logger } from 'common/logger';
import { createAsyncActionWithStates } from 'common/redux';
import { SERVICE_UPDATES, remoteControlClient } from 'common/remote-control';
import { ROUTES } from 'common/routing';
import { windowHandler } from 'common/utils';

import {
    SPOT_REMOTE_API_JOIN_CODE_RECEIVED,
    SPOT_REMOTE_COMPLETED_ONBOARDING,
    SPOT_REMOTE_EXIT_SHARE_MODE,
    SPOT_REMOTE_JOIN_CODE_INVALID,
    SPOT_REMOTE_JOIN_CODE_VALID,
    SPOT_REMOTE_SET_PERMANENT_PAIRING_CODE,
    SPOT_REMOTE_WILL_VALIDATE_JOIN_CODE
} from './actionTypes';
import { getPermanentPairingCode } from './selectors';


/**
 * Presence attributes from Spot-TV to store in redux.
 *
 * @type {Set}
 */
const presenceToStore = new Set([
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
    'tileView',
    'videoMuted',
    'view',
    'wiredScreensharingEnabled'
]);

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
        const serverConfig = getRemoteControlServerConfig(state);

        /**
         * The things done after successful connect.
         *
         * @returns {void}
         */
        function onSuccessfulConnect() {
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
        }

        /**
         * Things done when the connect attempt fails.
         *
         * @param {Error|string} error - What went wrong.
         * @returns {Promise}
         */
        function onDisconnect(error) {
            logger.error('On Spot Remote disconnect', { error });

            // Retry for permanent pairing as long as the backend accepts the code
            if (!isUnrecoverableError(error) && getPermanentPairingCode(getState())) {

                return doConnect();
            }

            dispatch(setPermanentPairingCode(''));

            dispatch({
                type: SPOT_REMOTE_JOIN_CODE_INVALID,
                joinCode,
                shareMode
            });

            _onDisconnected({ dispatch }, error);

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

            return remoteControlClient.connect({
                joinCode,
                backend,
                serverConfig
            })
                .then(onSuccessfulConnect)
                .catch(onDisconnect);
        }

        const store = {
            dispatch,
            getState
        };

        rcsListeners.push(
            remoteControlClient.addListener(
                SERVICE_UPDATES.RECONNECT_UPDATE,
                _onReconnectStatusChange.bind(null, store)));

        rcsListeners.push(
            remoteControlClient.addListener(
                SERVICE_UPDATES.SERVER_STATE_CHANGE,
                _onSpotTVStateChange.bind(null, store)));

        rcsListeners.push(
            remoteControlClient.addListener(
                SERVICE_UPDATES.UNRECOVERABLE_DISCONNECT,
                onDisconnect.bind(null, store)));

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
 * Callback called when the remote control service connection is unrecoverable broken.
 *
 * @param {Object} store - The Redux store.
 * @param {string} error - See {@link SERVICE_UPDATES.UNRECOVERABLE_DISCONNECT}.
 * @private
 * @returns {void}
 */
function _onDisconnected({ dispatch }, error) {
    logger.error('Spot-Remote lost connection to remote control service', { error });

    _clearSubscriptions();

    dispatch(clearSpotTVState());

    history.push(ROUTES.CODE);
}

/**
 * Callback invoked when remote control client has started or stopped to recover a broken connection
 * to the remote control service.
 *
 * @param {Object} store - The Redux store.
 * @param {Object} param - Details of the reconnection event.
 * @private
 * @returns {void}
 */
function _onReconnectStatusChange({ dispatch }, { isReconnecting }) {
    dispatch(setReconnectState(isReconnecting));
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

    Object.keys(updatedState).forEach(key => {
        if (presenceToStore.has(key)) {
            newState[key] = updatedState[key];
        }
    });

    dispatch(setSpotTVState(newState));

    if (updatedState.calendar) {
        try {
            const events = JSON.parse(updatedState.calendar);

            dispatch(setCalendarEvents(events));
        } catch (error) {
            logger.error(
                'Spot-Remote could not parse calendar events',
                { error }
            );
        }
    }
}

/**
 * Stores the given permanent pairing code which is to be used Spot Remote to connect to the Spot TV next time the app
 * is started.
 *
 * @param {string} permanentPairingCode - A permanent pairing code to be stored.
 * @returns {{
 *     type: SPOT_REMOTE_SET_PERMANENT_PAIRING_CODE,
 *     permanentPairingCode: string
 * }}
 */
function setPermanentPairingCode(permanentPairingCode) {
    return {
        type: SPOT_REMOTE_SET_PERMANENT_PAIRING_CODE,
        permanentPairingCode
    };
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

