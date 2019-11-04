import {
    CREATE_CONNECTION,
    addPairedRemote,
    clearAllPairedRemotes,
    destroyConnection,
    getJoinCodeRefreshRate,
    getRemoteControlServerConfig,
    getSpotServicesConfig,
    getTemporaryRemoteIds,
    isP2PSignalingEnabled,
    reconnectScheduleUpdate,
    removePairedRemote,
    setCustomerId,
    setDisplayName,
    setRemoteJoinCode,
    setRoomId,
    setJwt,
    setTenant
} from 'common/app-state';
import { WebUpdateChecker } from 'common/auto-update';
import { setSpotInstanceInfo } from 'common/app-state/device-id';
import { createAsyncActionWithStates } from 'common/async-actions';
import { isBackendEnabled, setPermanentPairingCode } from 'common/backend';
import { logger } from 'common/logger';
import {
    SERVICE_UPDATES,
    remoteControlServer
} from 'common/remote-control';
import { getJitterDelay, windowHandler } from 'common/utils';

import {
    SPOT_TV_PAIR_TO_BACKEND_PENDING,
    SPOT_TV_PAIR_TO_BACKEND_FAIL,
    SPOT_TV_PAIR_TO_BACKEND_SUCCESS,
    getLongLivedPairingCodeInfo,
    setLongLivedPairingCodeInfo,
    SpotTvBackendService
} from '../backend';
import { nativeController } from '../native-functions/native-controller';

import { SPOT_TV_CONNECTION_FAILED } from './actionTypes';

let eventHandlerRemovers;

/**
 * Action dispatched by the UI in order to pair Spot TV with the backend.
 *
 * @param {string} pairingCode - The backend pairing code.
 * @returns {Function}
 */
export function pairWithBackend(pairingCode) {
    return dispatch => {
        dispatch({ type: SPOT_TV_PAIR_TO_BACKEND_PENDING });

        return dispatch(createSpotTVRemoteControlConnection({
            pairingCode,
            retry: false
        }))
            .then(() => dispatch(generateLongLivedPairingCode())
                .catch(error => {

                    // This intentionally disconnects only on the generateLongLivedPairingCode failure, because
                    // it's not part of the connect promise and will not cause disconnect, causing the connection
                    // to be left behind.
                    logger.error('Failed to generate long lived pairing code', { error });
                    dispatch(disconnectSpotTvRemoteControl());

                    throw error;
                })
            )
            .then(
                () => dispatch({ type: SPOT_TV_PAIR_TO_BACKEND_SUCCESS }),
                error => {
                    dispatch({ type: SPOT_TV_PAIR_TO_BACKEND_FAIL });

                    throw error;
                });
    };
}

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
    let initiallyConnected = false;

    return (dispatch, getState) => {
        if (remoteControlServer.hasConnection()) {
            return Promise.reject('Called to create connection while connection exists');
        }

        eventHandlerRemovers = [
            [
                SERVICE_UPDATES.UNRECOVERABLE_DISCONNECT,
                onDisconnect
            ],
            [
                SERVICE_UPDATES.REMOTE_JOIN_CODE_CHANGE,
                onRemoteJoinCodeChange
            ],
            [
                SERVICE_UPDATES.REGISTRATION_UPDATED,
                onRegistrationChange
            ],
            [
                SERVICE_UPDATES.CLIENT_JOINED,
                onRemoteConnected
            ],
            [
                SERVICE_UPDATES.CLIENT_LEFT,
                onRemoteDisconnected
            ]
        ].map(([ event, callback ]) => remoteControlServer.addListener(
            event,
            callback
        ));

        const onBeforeUnloadHandler = event => dispatch(disconnectSpotTvRemoteControl(event));

        window.addEventListener('beforeunload', onBeforeUnloadHandler);

        eventHandlerRemovers.push(() => {
            window.removeEventListener('beforeunload', onBeforeUnloadHandler);
        });

        /**
         * Callback invoked when a connect has been successfully made with
         * {@code remoteControlServer}.
         *
         * @param {Object} result - Includes information specific about the
         * connection.
         * @returns {void}
         */
        function onSuccessfulConnect(result) {
            logger.log('Successfully created connection for remote control server');

            const {
                jwt,
                permanentPairingCode,
                remoteJoinCode,
                roomProfile,
                tenant
            } = result;

            initiallyConnected = true;

            dispatch(setRemoteJoinCode(remoteJoinCode));
            dispatch(setJwt(jwt));
            dispatch(setTenant(tenant));
            dispatch(setPermanentPairingCode(permanentPairingCode));
            roomProfile && dispatch(setCustomerId(roomProfile.customerId));
            dispatch(reconnectScheduleUpdate(false));

            if (isBackendEnabled(getState())) {
                dispatch(setRoomId(roomProfile.id));
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
            logger.log('Detected remote control connection', {
                id,
                type
            });

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
            logger.log('Detected remote control disconnect', { id });

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
            const isRecoverableError = remoteControlServer.isRecoverableRequestError(error);
            const usingPermanentPairingCode = Boolean(pairingCode);
            const canRecoverConnection = !usingPermanentPairingCode || isRecoverableError;

            /**
             * The connection is retried if explicit 'retry' flag has been set or if the connection succeeds initially.
             * Even if both conditions are met, the connection will be dropped when using permanent pairing and
             * the error is not recoverable.
             *
             * @type {boolean}
             */
            const willRetry = (retry || initiallyConnected) && canRecoverConnection;

            logger.error('Spot-TV disconnected from the remote control server.', {
                error,
                initiallyConnected,
                isRecoverableError,
                retry,
                usingPermanentPairingCode,
                willRetry
            });

            dispatch(spotTvConnectionFailed({
                error,
                initiallyConnected,
                isRecoverableError,
                retry,
                usingPermanentPairingCode,
                willRetry
            }));

            if (initiallyConnected) {
                dispatch(reconnectScheduleUpdate(willRetry));
            }

            dispatch(destroyConnection());
            dispatch(setRemoteJoinCode(''));
            dispatch(clearAllPairedRemotes());

            if (usingPermanentPairingCode && !isRecoverableError) {
                logger.log('Clearing permanent pairing code on unrecoverable disconnect');

                // Clear the permanent pairing code
                dispatch(setPermanentPairingCode(''));
            }

            if (willRetry) {
                const jitter = getJitterDelay(3);

                logger.log(`Spot TV will try to reconnect after ${jitter}ms`);

                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        doConnect().then(resolve, reject);
                    }, jitter);
                });
            }

            removeEventHandlers();

            throw error;
        }

        /**
         * Callback invoked when {@code remoteControlServer} has updated its
         * connection state with the backend.
         *
         * @param {Object} pairingInfo - Information necessary to establish and
         * maintain a connection to the server.
         * @param {string} pairingInfo.jwt - The latest valid jwt for
         * communicating with other backend services.
         * @param {string} [pairingInfo.tenant] - The tenant name advertised by the backend.
         * @private
         * @returns {void}
         */
        function onRegistrationChange({ jwt, tenant }) {
            dispatch(setJwt(jwt));
            dispatch(setTenant(tenant));
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

        return doConnect();
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
    const enableP2PSignaling = isP2PSignalingEnabled(state);

    logger.log('Spot TV attempting connection', {
        backend: Boolean(backend),
        permanentPairingCode: Boolean(permanentPairingCode)
    });

    if (backend && !permanentPairingCode) {
        return Promise.reject('The pairing code is required when the backend is enabled');
    }

    return remoteControlServer.connect({
        backend,
        enableP2PSignaling,
        joinAsSpot: true,
        joinCodeRefreshRate,
        joinCode: permanentPairingCode,
        serverConfig: remoteControlConfiguration
    }).then(roomProfile => {
        return {
            permanentPairingCode,
            remoteJoinCode: remoteControlServer.getRemoteJoinCode(),
            roomProfile,
            tenant: backend ? backend.getTenant() : undefined,
            jwt: backend ? backend.getJwt() : undefined
        };
    });
}

/**
 * To be called by the Spot-TV to cause all known temporary Spot-Remotes to
 * become disconnected.
 *
 * @returns {Function} A function which returns a Promise that resolves if all
 * removal requests were successfully sent.
 */
export function disconnectAllTemporaryRemotes() {
    return (dispatch, getState) => {
        const disconnectPromises = getTemporaryRemoteIds(getState())
            .map(remoteId => remoteControlServer.disconnectRemoteControl(remoteId));

        return Promise.all(disconnectPromises);
    };
}

/**
 * The action kills the Spot TV remote control service connection if one exists.
 *
 * @param {Object} [event] - Optionally, the event which triggered the necessity to disconnect.
 * @returns {Function}
 */
export function disconnectSpotTvRemoteControl(event) {
    return dispatch => {
        if (!remoteControlServer.hasConnection()) {
            return Promise.resolve();
        }

        removeEventHandlers();

        // NOTE When trying to execute the cleanup before disconnect then the disconnect does not happen if triggered by
        // the on before unload event handler.
        const postDisconnectCleanup = () => {
            dispatch(reconnectScheduleUpdate(false));
            dispatch(destroyConnection());
            dispatch(setRemoteJoinCode(''));
            dispatch(clearAllPairedRemotes());
        };

        return remoteControlServer.disconnect(event)
            .then(postDisconnectCleanup, postDisconnectCleanup);
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
 * Removes event handlers registered when starting the connection.
 *
 * @returns {void}
 */
function removeEventHandlers() {
    eventHandlerRemovers.forEach(remover => remover());
    eventHandlerRemovers = [];
}

/**
 * Action dispatched when connection either fails to establish initially or disconnects.
 *
 * @param {Error|string} error - The error that caused disconnect.
 * @param {boolean} willRetry - The flag indicates whether or not Spot TV will make an attempt to reconnect after this
 * failure.
 * @param {...*} otherFlags - Other flag which impacts the decision on whether or not the connection will be
 * re-established after this failure.
 * @returns {Object}
 */
function spotTvConnectionFailed({ error, willRetry, ...otherFlags }) {
    return {
        type: SPOT_TV_CONNECTION_FAILED,
        error: typeof error === 'object' ? error.message : error,
        willRetry,
        ...otherFlags
    };
}

/**
 * Prepares and executes a page reload to force Spot-TV to download the latest
 * assets. This reload is to get any bundle updates and to clear any memory leaks.
 *
 * @returns {Promise}
 */
function updateSpotTVSource() {
    return remoteControlServer.disconnect()
        .then(() => windowHandler.reload());
}

/**
 * Action dispatched when it is OK(or not) to do an update meaning there's no ongoing meeting in progress and
 * the current time falls within the pre-configured time range.
 *
 * @param {boolean} isOkToUpdate - Whether or not now it's OK to do an update.
 * @returns {Function}
 */
export function setOkToUpdate(isOkToUpdate) {
    return () => {
        // Let the spot-electron know that it's okay(or not) to do an update if available.
        nativeController.sendMessage('spot-electron/auto-updater', { updateAllowed: isOkToUpdate });

        if (isOkToUpdate && WebUpdateChecker.isWebUpdateAvailable()) {
            return updateSpotTVSource();
        }

        return Promise.resolve();
    };
}
