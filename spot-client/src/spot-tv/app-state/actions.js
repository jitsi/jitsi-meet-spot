import {
    CREATE_CONNECTION,
    addPairedRemote,
    clearAllPairedRemotes,
    getJoinCodeRefreshRate,
    getRemoteControlServerConfig,
    getSpotServicesConfig,
    removePairedRemote,
    setDisplayName,
    setRemoteJoinCode,
    setJwt,
    setReconnectState
} from 'common/app-state';
import { setSpotInstanceInfo } from 'common/app-state/device-id';
import { createAsyncActionWithStates } from 'common/async-actions';
import { isBackendEnabled } from 'common/backend';
import { logger } from 'common/logger';
import {
    SERVICE_UPDATES,
    remoteControlServer
} from 'common/remote-control';
import { windowHandler } from 'common/utils';

import {
    SPOT_TV_PAIR_TO_BACKEND_PENDING,
    SPOT_TV_PAIR_TO_BACKEND_FAIL,
    SPOT_TV_PAIR_TO_BACKEND_SUCCESS,
    getLongLivedPairingCodeInfo,
    setLongLivedPairingCodeInfo,
    setPermanentPairingCode,
    SpotTvBackendService
} from '../backend';

/**
 * Establishes a connection to an existing Spot-MUC using the provided join code.
 *
 * @param {string} [pairingCode] - A permanent pairing code to be used only with the backend integration where Spot TV
 * needs a code in order to connect. Without the backend a Spot TV chooses a random code on it's own and sets it as
 * a MUC lock.
 * @param {boolean} retry - Whether the connection should be retried in case it fails initially. Without this option
 * the remote control service should still reconnect after the first attempt succeeds and if later the connection is
 * lost due to network issues.
 * @returns {Object}
 */
export function createSpotTVRemoteControlConnection({ pairingCode, retry }) {
    return (dispatch, getState) => {
        if (remoteControlServer.hasConnection()) {
            return Promise.reject('Called to create connection while connection exists');
        }

        dispatch({ type: SPOT_TV_PAIR_TO_BACKEND_PENDING });

        /**
         * Callback invoked when a connect has been successfully made with
         * {@code remoteControlServer}.
         *
         * @param {Object} result - Includes information specific about the
         * connection.
         * @returns {void}
         */
        function onSuccessfulConnect(result) {
            const {
                jwt,
                permanentPairingCode,
                remoteJoinCode,
                roomProfile
            } = result;

            dispatch(setRemoteJoinCode(remoteJoinCode));
            dispatch(setJwt(jwt));
            dispatch(setPermanentPairingCode(permanentPairingCode));

            if (isBackendEnabled(getState())) {
                dispatch(setSpotInstanceInfo({
                    isPairingPermanent: true,
                    isSpotTv: true,
                    roomId: roomProfile.id
                }));
                dispatch(setDisplayName(roomProfile.name));
            }
        }

        /**
         * Callback invoked when a new Spot-Remote has connected to with the
         * {@code remoteControlServer}.
         *
         * @param {Object} remote - Identifying about the Spot-Remote.
         * @returns {void}
         */
        function onRemoteConnected({ id, type }) {
            dispatch(addPairedRemote(id, type));
        }

        /**
         * Callback invoked when a Spot-Remote has disconnected to with the
         * {@code remoteControlServer}.
         *
         * @param {Object} remote - Identifying about the Spot-Remote.
         * @returns {void}
         */
        function onRemoteDisconnected({ id }) {
            dispatch(removePairedRemote(id));
        }

        /**
         * Callback invoked when {@code remoteControlServer} has been
         * disconnected from an unrecoverable error.
         *
         * @param {Error|string} error - The error returned by the {@code remoteControlServer}.
         * @private
         * @returns {Promise}
         */
        function onDisconnect(error) {
            logger.error('Spot-TV disconnected from the remote control server.', { error });
            dispatch(setRemoteJoinCode(''));
            dispatch(clearAllPairedRemotes());

            if (pairingCode && remoteControlServer.isUnrecoverableRequestError(error)) {
                // Clear the permanent pairing code
                dispatch(setPermanentPairingCode(''));

                throw error;
            } else if (retry) {
                doConnect();
            } else {
                throw error;
            }
        }

        /**
         * Callback invoked when {@code remoteControlServer} has started or
         * stopped trying to re-establish a connection to the remote control
         * service.
         *
         * @private
         * @returns {void}
         */
        function onReconnectChange({ isReconnecting }) {
            dispatch(setReconnectState(isReconnecting));
        }

        /**
         * Callback invoked when {@code remoteControlServer} has updated its
         * connection state with the backend.
         *
         * @param {Object} pairingInfo - Information necessary to establish and
         * maintain a connection tot he server.
         * @param {string} pairingInfo.jwt - The latest valid jwt for
         * communicating with other backend services.
         * @private
         * @returns {void}
         */
        function onRegistrationChange({ jwt }) {
            dispatch(setJwt(jwt));
        }

        /**
         * Callback invoked when {@code remoteControlServer} has changed
         * the join code necessary to pair with the Spot-TV.
         *
         * @param {Object} data - An object containing the update.
         * @private
         * @returns {void}
         */
        function onRemoteJoinCodeChange({ remoteJoinCode }) {
            dispatch(setRemoteJoinCode(remoteJoinCode));
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
                () => createConnection(getState(), pairingCode),
                CREATE_CONNECTION
            ).then(onSuccessfulConnect)
            .catch(onDisconnect);
        }

        remoteControlServer.addListener(
            SERVICE_UPDATES.UNRECOVERABLE_DISCONNECT,
            onDisconnect
        );
        remoteControlServer.addListener(
            SERVICE_UPDATES.REMOTE_JOIN_CODE_CHANGE,
            onRemoteJoinCodeChange
        );
        remoteControlServer.addListener(
            SERVICE_UPDATES.RECONNECT_UPDATE,
            onReconnectChange
        );
        remoteControlServer.addListener(
            SERVICE_UPDATES.REGISTRATION_UPDATED,
            onRegistrationChange
        );
        remoteControlServer.addListener(
            SERVICE_UPDATES.CLIENT_JOINED,
            onRemoteConnected
        );
        remoteControlServer.addListener(
            SERVICE_UPDATES.CLIENT_LEFT,
            onRemoteDisconnected
        );

        return doConnect()
            .then(() => dispatch({ type: SPOT_TV_PAIR_TO_BACKEND_SUCCESS }))
            .catch(error => {
                dispatch({ type: SPOT_TV_PAIR_TO_BACKEND_FAIL });

                return Promise.reject(error);
            });
    };
}

/**
 * Interacts with the {@code remoteControlServer} to create a connection
 * to be consumed by a Spot-TV client.
 *
 * @param {Object} state - The Redux state.
 * @param {string} [permanentPairingCode] - This one is optional and used only in the backend scenario where Spot TV
 * needs a permanent pairing code in order to connect to the service.
 * @returns {Promise<Object>} Resolves with an object containing the latest
 * join code and jwt.
 */
function createConnection(state, permanentPairingCode) {
    const joinCodeRefreshRate = getJoinCodeRefreshRate(state);
    const remoteControlConfiguration = getRemoteControlServerConfig(state);
    const backend
        = isBackendEnabled(state)
            ? new SpotTvBackendService(getSpotServicesConfig(state))
            : null;

    logger.log('Spot TV attempting connection', {
        backend: Boolean(backend),
        permanentPairingCode: Boolean(permanentPairingCode)
    });

    if (backend && !permanentPairingCode) {
        return Promise.reject('The pairing code is required when the backend is enabled');
    }

    return remoteControlServer.connect({
        backend,
        joinAsSpot: true,
        joinCodeRefreshRate,
        joinCode: permanentPairingCode,
        serverConfig: remoteControlConfiguration
    }).then(roomProfile => {
        return {
            permanentPairingCode,
            remoteJoinCode: remoteControlServer.getRemoteJoinCode(),
            roomProfile,
            jwt: backend ? backend.getJwt() : undefined
        };
    });
}

/**
 * The action kills the Spot TV remote control service connection if one exists.
 *
 * @returns {Function}
 */
export function disconnectSpotTvRemoteControl() {
    return () => {
        if (!remoteControlServer.hasConnection()) {
            return Promise.resolve();
        }

        return remoteControlServer.disconnect();
    };
}

/**
 * Requests a new long lived pairing code be created.
 *
 * @returns {Function}
 */
export function generateLongLivedPairingCode() {
    return dispatch => remoteControlServer.generateLongLivedPairingCode()
        .then(longLivedPairingCodeInfo =>
            dispatch(setLongLivedPairingCodeInfo(longLivedPairingCodeInfo)));
}

/**
 * Checks if the currently known long lived pairing code, if any, has expired,
 * and gets a new code if expired. The new code will be dispatched as an action.
 *
 * @returns {Function}
 */
export function generateLongLivedPairingCodeIfExpired() {
    return (dispatch, getState) => {
        const info = getLongLivedPairingCodeInfo(getState());

        const oneHour = 1000 * 60 * 60;
        const expiresIn = info && (info.expires - Date.now());

        if (!info || expiresIn < oneHour) {
            logger.log('Long lived pairing code does not exist or expired already', { expiresIn });

            return dispatch(generateLongLivedPairingCode());
        }

        return Promise.resolve();
    };
}

/**
 * Prepares and executes a page reload to force Spot-TV to download the latest
 * assets.
 *
 * @returns {Function}
 */
export function updateSpotTVSource() {
    return () => remoteControlServer.disconnect()
        .then(() => windowHandler.reload());
}
