import { analytics } from 'common/analytics';
import {
    BOOTSTRAP_COMPLETE,
    CREATE_CONNECTION,
    addNotification,
    clearSpotTVState,
    getJoinCode,
    getJoinCodeRefreshRate,
    getRemoteControlServerConfig,
    getShareDomain,
    getSpotServicesConfig,
    requestStates,
    requestTypes,
    setCalendarEvents,
    setJoinCode,
    setJwt,
    setRequestState,
    setSpotTVState
} from 'common/app-state';
import { registerDevice } from 'common/backend';
import { history } from 'common/history';
import { logger } from 'common/logger';
import { MiddlewareRegistry } from 'common/redux';
import { SERVICE_UPDATES, remoteControlService } from 'common/remote-control';
import { ROUTES } from 'common/routing';

/**
 * Presence attributes from Spot-TV to store as booleans in redux.
 *
 * @type {Set}
 */
const presenceToStoreAsBoolean = new Set([
    'audioMuted',
    'screensharing',
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
    'joinCode',
    'screensharingType',
    'spotId',
    'view'
]);

MiddlewareRegistry.register(store => next => action => {
    const result = next(action);

    switch (action.type) {
    case BOOTSTRAP_COMPLETE: {
        // Spot-TV should create a connection immediately and try to maintain
        // an active connection, whereas Spot-Remote should connect on demand
        // and be able to disconnect.
        if (store.getState().setup.isSpot) {
            // TODO: move this call into analytics.
            analytics.updateProperty('spot-tv', true);

            remoteControlService.addListener(
                SERVICE_UPDATES.JOIN_CODE_CHANGE,
                data => store.dispatch(setJoinCode(data.joinCode))
            );

            remoteControlService.addListener(
                SERVICE_UPDATES.UNRECOVERABLE_DISCONNECT,
                () => {
                    logger.error('Spot-TV encountered disconnect.');
                    remoteControlService.disconnect();
                    store.dispatch(setJoinCode(''));
                    loadRemoteControlService(store, true);
                }
            );

            loadRemoteControlService(store, true);
        }

        break;
    }

    // CREATE_CONNECTION should be called explicitly by Spot-Remotes to connect
    // to a Spot-TV.
    case CREATE_CONNECTION: {
        if (remoteControlService.hasConnection()) {
            break;
        }

        const onChange = onSpotTVStateChange.bind(null, store.dispatch);

        /**
         * Callback to invoke when a disconnect occurs. Attempts to de-register
         * itself and other callbacks.
         *
         * @returns {void}
         */
        function onDisconnect() { // eslint-disable-line no-inner-declarations
            remoteControlService.removeListener(
                SERVICE_UPDATES.SPOT_TV_STATE_CHANGE,
                onChange
            );

            remoteControlService.removeListener(
                SERVICE_UPDATES.UNRECOVERABLE_DISCONNECT,
                onDisconnect
            );

            onSpotRemoteDisconnectedFromService(store);
        }

        remoteControlService.addListener(
            SERVICE_UPDATES.SPOT_TV_STATE_CHANGE,
            onChange
        );

        remoteControlService.addListener(
            SERVICE_UPDATES.UNRECOVERABLE_DISCONNECT,
            onDisconnect
        );

        store.dispatch(setJoinCode(action.joinCode));

        loadRemoteControlService(store, false)
            .then(() => {
                let redirectTo = ROUTES.REMOTE_CONTROL;

                const shareDomain = getShareDomain(store.getState());

                if (shareDomain && window.location.host.includes(shareDomain)) {
                    redirectTo = ROUTES.SHARE;
                } else {
                    const queryParams
                        = new URLSearchParams(window.location.search);

                    if (queryParams.get('share') === 'true') {
                        redirectTo = ROUTES.SHARE;
                    }
                }

                history.push(redirectTo);
            })
            .catch(error => {
                logger.error('Error while creating connection', { error });

                onSpotRemoteDisconnectedFromService(store);
            });

        break;
    }
    }

    return result;
});

/**
 * Establishes the connection to the remote control service.
 *
 * @param {Object} store - The Redux store.
 * @param {boolean} joinAsSpotTV - Whether or not to treat the connection as
 * being a connection between the service and a Spot-TV.
 * @returns {Promise}
 */
function loadRemoteControlService({ dispatch, getState }, joinAsSpotTV) {
    const state = getState();
    const {
        adminServiceUrl,
        joinCodeServiceUrl
    } = getSpotServicesConfig(state);
    const _joinCode = getJoinCode(state);
    const joinCodeRefreshRate = getJoinCodeRefreshRate(state);
    const remoteControlConfiguration = getRemoteControlServerConfig(state);
    let getJoinCodePromise;

    if (adminServiceUrl) {
        logger.log(`Will use ${adminServiceUrl} to get the join code`);

        getJoinCodePromise = registerDevice(adminServiceUrl)
            .then(json => {
                const { joinCode, jwt } = json;

                // Clear it if the jwt is empty
                dispatch(setJwt(jwt));

                return joinCode;
            });
    } else {
        getJoinCodePromise = Promise.resolve(_joinCode);
    }

    dispatch(setRequestState(
        requestTypes.CONNECTION,
        requestStates.PENDING
    ));

    return getJoinCodePromise
        .then(joinCode => {
            logger.log(`Will use ${joinCode} code to setup the Spot TV`);

            dispatch(setJoinCode(joinCode));

            return remoteControlService.connect({
                autoReconnect: true,
                joinAsSpot: joinAsSpotTV,
                joinCode,

                // FIXME join code refresh is disabled with the backend as the first step,
                // because there's no password set on the room and the JWT is used instead.
                joinCodeRefreshRate: !adminServiceUrl && joinCodeRefreshRate,
                joinCodeServiceUrl,
                serverConfig: remoteControlConfiguration
            });
        })
        .then(() => {
            dispatch(setRequestState(
                requestTypes.CONNECTION,
                requestStates.DONE
            ));
        })
        .catch(error => {
            dispatch(setRequestState(
                requestTypes.CONNECTION,
                requestStates.ERROR
            ));

            return Promise.reject(error);
        });
}

/**
 * Callback invoked when {@code remoteControlService} has an update about
 * the current state of a Spot-TV.
 *
 * @param {Object} dispatch - The Redux function to update a store.
 * @param {Object} data - Details of the Spot-TV's current state.
 * @private
 * @returns {void}
 */
function onSpotTVStateChange(dispatch, data) {
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
 * Helper which cleans up Spot-TV related state from a Spot-Remote instance.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @returns {void}
 */
function onSpotRemoteDisconnectedFromService({ dispatch }) {
    logger.error('Spot-Remote could not connect to remote control service');

    // Call disconnect to ensure state is cleared.
    remoteControlService.disconnect();

    dispatch(clearSpotTVState());

    dispatch(setRequestState(
        requestTypes.CONNECTION,
        requestStates.ERROR
    ));

    dispatch(addNotification('error', 'Something went wrong'));

    history.push('/');
}
