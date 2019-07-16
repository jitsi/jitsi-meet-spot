import {
    CREATE_CONNECTION,
    getJoinCodeRefreshRate,
    getRemoteControlServerConfig,
    getSpotServicesConfig,
    setDisplayName,
    setRemoteJoinCode,
    setJwt,
    setReconnectState,
    setRoomId
} from 'common/app-state';
import {
    isBackendEnabled,
    isUnrecoverableError
} from 'common/backend';
import { logger } from 'common/logger';
import { createAsyncActionWithStates } from 'common/redux';
import {
    SERVICE_UPDATES,
    remoteControlServer
} from 'common/remote-control';
import { windowHandler } from 'common/utils';

import {
    SPOT_TV_PAIR_TO_BACKEND_PENDING,
    SPOT_TV_PAIR_TO_BACKEND_FAIL,
    SPOT_TV_PAIR_TO_BACKEND_SUCCESS,
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
                dispatch(setRoomId(roomProfile.id));
                dispatch(setDisplayName(roomProfile.name));
            }
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

            if (pairingCode && isUnrecoverableError(error)) {
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
 * Prepares and executes a page reload to force Spot-TV to download the latest
 * assets.
 *
 * @returns {Function}
 */
export function updateSpotTVSource() {
    return () => remoteControlServer.disconnect()
        .then(() => windowHandler.reload());
}
