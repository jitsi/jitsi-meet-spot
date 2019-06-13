import {
    PASSWORD,
    clearSpotTVState,
    getRemoteControlServerConfig,
    getSpotServicesConfig,
    setCalendarEvents,
    setReconnectState,
    setSpotTVState
} from 'common/app-state';
import { isBackendEnabled, SpotBackendService } from 'common/backend';
import { history } from 'common/history';
import { logger } from 'common/logger';
import { createAsyncActionWithStates } from 'common/redux';
import { SERVICE_UPDATES, remoteControlClient } from 'common/remote-control';
import { ROUTES } from 'common/routing';

import {
    SPOT_REMOTE_EXIT_SHARE_MODE,
    SPOT_REMOTE_JOIN_CODE_INVALID,
    SPOT_REMOTE_JOIN_CODE_VALID,
    SPOT_REMOTE_WILL_VALIDATE_JOIN_CODE
} from './actionTypes';


/**
 * Presence attributes from Spot-TV to store as booleans in redux.
 *
 * @type {Set}
 */
const presenceToStoreAsBoolean = new Set([
    'audioMuted',
    'electron',
    'needPassword',
    'screensharing',
    'tileView',
    'videoMuted',
    'wiredScreensharingEnabled'
]);

/**
 * Presence attributes from Spot-TV to store as strings in redux.
 *
 * @type {Set}
 */
const presenceToStoreAsString = new Set([
    'inMeeting',
    'remoteJoinCode',
    'roomName',
    'screensharingType',
    'spotId',
    'view'
]);

/**
 * {@link _onDisconnected} listener bound to the remote control service.
 *
 * @type {function}
 */
let onDisconnectedHandler = null;

/**
 * {@link _onReconnectStatusChange} listener bound to the remote control service.
 *
 * @type {function}
 */
let onReconnectStatusChangedHandler = null;

/**
 * {@link _onSpotTVStateChange} listener bound to the remote control service.
 *
 * @type {function}
 */
let onSpotStateChangedHandler = null;

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

        _setSubscriptions({
            dispatch,
            getState
        });

        const state = getState();
        const backend
            = isBackendEnabled(state)
                ? new SpotBackendService(getSpotServicesConfig(state))
                : null;

        logger.log('Spot Remote attempting connection', {
            backend: Boolean(backend)
        });

        return remoteControlClient.connect({
            joinCode,
            backend,
            serverConfig: getRemoteControlServerConfig(state)
        }).then(() => {
            dispatch({
                type: SPOT_REMOTE_JOIN_CODE_VALID,
                joinCode,
                shareMode
            });
        })
        .catch(error => {
            // FIXME emit another action when the connect fails due to error other than the invalid join code
            dispatch({
                type: SPOT_REMOTE_JOIN_CODE_INVALID,
                joinCode,
                shareMode
            });

            _onDisconnected({ dispatch }, error);

            throw error;
        });
    };
}

/**
 * Removes listeners set on the remote control service.
 *
 * @private
 * @returns {void}
 */
function _clearSubscriptions() {
    if (onDisconnectedHandler) {
        remoteControlClient.removeListener(
            SERVICE_UPDATES.UNRECOVERABLE_DISCONNECT,
            onDisconnectedHandler
        );
        onDisconnectedHandler = null;
    }
    if (onReconnectStatusChangedHandler) {
        remoteControlClient.removeListener(
            SERVICE_UPDATES.RECONNECT_UPDATE,
            onReconnectStatusChangedHandler
        );
        onReconnectStatusChangedHandler = null;
    }
    if (onSpotStateChangedHandler) {
        remoteControlClient.removeListener(
            SERVICE_UPDATES.SERVER_STATE_CHANGE,
            onSpotStateChangedHandler
        );
        onSpotStateChangedHandler = null;
    }
}

/**
 * Callback called when the remote control service connection is unrecoverable broken.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
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
        if (presenceToStoreAsBoolean.has(key)) {
            newState[key] = updatedState[key] === 'true';
        } else if (presenceToStoreAsString.has(key)) {
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
 * Sets listeners on the remote control service.
 *
 * @param {Object} store - The Redux store.
 * @private
 * @returns {void}
 */
function _setSubscriptions(store) {
    onReconnectStatusChangedHandler = _onReconnectStatusChange.bind(null, store);

    remoteControlClient.addListener(
        SERVICE_UPDATES.RECONNECT_UPDATE,
        onReconnectStatusChangedHandler);

    onSpotStateChangedHandler = _onSpotTVStateChange.bind(null, store);

    remoteControlClient.addListener(
        SERVICE_UPDATES.SERVER_STATE_CHANGE,
        onSpotStateChangedHandler);

    onDisconnectedHandler = _onDisconnected.bind(null, store);

    remoteControlClient.addListener(
        SERVICE_UPDATES.UNRECOVERABLE_DISCONNECT,
        onDisconnectedHandler);
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
