import {
    CREATE_CONNECTION,
    getJoinCodeRefreshRate,
    getRemoteControlServerConfig,
    getSpotServicesConfig,
    setJoinCode,
    setJwt,
    setReconnectState
} from 'common/app-state';

import { registerDevice } from 'common/backend';
import { logger } from 'common/logger';
import { createAsyncActionWithStates } from 'common/redux';
import {
    SERVICE_UPDATES,
    remoteControlServer
} from 'common/remote-control';

/**
 * Establishes a connection to an existing Spot-MUC using the provided join code.
 *
 * @returns {Object}
 */
export function createSpotTVRemoteControlConnection() {
    return (dispatch, getState) => {
        if (remoteControlServer.hasConnection()) {
            logger.warn('Called to create connection while connection exists');

            return;
        }

        /**
         * Callback invoked when a connect has been successfully made with
         * {@code remoteControlServer}.
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
         * Callback invoked when {@code remoteControlServer} has been
         * disconnected from an unrecoverable error. Tries to reconnect.
         *
         * @private
         * @returns {void}
         */
        function onDisconnect() {
            logger.error(
                'Spot-TV disconnected from the remote control server.');
            dispatch(setJoinCode(''));
            doConnect();
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
         * Callback invoked when {@code remoteControlServer} has changed
         * the join code necessary to pair with the Spot-TV.
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

        remoteControlServer.addListener(
            SERVICE_UPDATES.UNRECOVERABLE_DISCONNECT,
            onDisconnect
        );
        remoteControlServer.addListener(
            SERVICE_UPDATES.JOIN_CODE_CHANGE,
            onJoinCodeChange
        );
        remoteControlServer.addListener(
            SERVICE_UPDATES.RECONNECT_UPDATE,
            onReconnectChange
        );

        return doConnect();
    };
}

/**
 * Interacts with the {@code remoteControlServer} to create a connection
 * to be consumed by a Spot-TV client.
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

            return remoteControlServer.exchangeCode(
                    joinCode,
                    {
                        joinCodeServiceUrl
                    }
            );
        })
        .then(roomInfo => remoteControlServer.connect({
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
                joinCode: finalJoinCode || remoteControlServer.getJoinCode(),
                jwt: finalJwt
            };
        });
}
