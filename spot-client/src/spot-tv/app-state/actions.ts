import type { RootState } from 'common/app-state';
import {
    CREATE_CONNECTION,
    addNotification,
    destroyConnection,
    getJoinCodeRefreshRate,
    getMeetingDomainsWhitelist,
    getRemoteControlServerConfig,
    getSpotServicesConfig,
    isCalendarPushEnabled,
    reconnectScheduleUpdate,
    setCustomerId,
    setDisplayName,
    setIsPermanentRemotePaired,
    setJwt,
    setRemoteJoinCode,
    setRoomId,
    setTenant
} from 'common/app-state';
import { setSpotInstanceInfo } from 'common/app-state/device-id';
import { createAsyncActionWithStates } from 'common/async-actions';
import { isBackendEnabled, setPermanentPairingCode } from 'common/backend';
import { pushRoute } from 'common/history';
import { logger } from 'common/logger';
import {
    CLIENT_TYPES,
    SERVICE_UPDATES,
    remoteControlServer
} from 'common/remote-control';
import { ROUTES } from 'common/routing';
import { getJitterDelay, windowHandler } from 'common/utils';

import { isValidMeetingName, isValidMeetingUrl } from '../../common/utils';
import {
    SPOT_TV_PAIR_TO_BACKEND_FAIL,
    SPOT_TV_PAIR_TO_BACKEND_PENDING,
    SPOT_TV_PAIR_TO_BACKEND_SUCCESS,
    SpotTvBackendService,
    getLongLivedPairingCodeInfo,
    setLongLivedPairingCodeInfo
} from '../backend';

import { calendarService } from './../calendars';
import { SPOT_TV_CONNECTION_FAILED, SPOT_TV_SET_MEETING_SUMMARY } from './actionTypes';
import { getDefaultMeetingDomain } from './selectors';

let eventHandlerRemovers: Array<() => void>;

/**
 * Action dispatched by the UI in order to pair Spot TV with the backend.
 *
 * @param pairingCode - The backend pairing code.
 * @returns {Function}
 */
export function pairWithBackend(pairingCode: string) {
    return (dispatch: any) => {
        dispatch({ type: SPOT_TV_PAIR_TO_BACKEND_PENDING });

        return dispatch(createSpotTVRemoteControlConnection({
            pairingCode,
            retry: false
        }))
            .then(() => dispatch(generateLongLivedPairingCode())
                .catch((error: any) => {

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
                (error: any) => {
                    dispatch({ type: SPOT_TV_PAIR_TO_BACKEND_FAIL });

                    throw error;
                });
    };
}

/**
 * Establishes a connection to an existing Spot-MUC using the provided join code.
 *
 * @param pairingCode - A permanent pairing code to be used only with the backend integration where Spot TV
 * needs a code in order to connect. Without the backend a Spot TV chooses a random code on it's own and sets it as
 * a MUC lock.
 * @param retry - Whether the connection should be retried in case it fails initially. Without this option
 * the remote control service should still reconnect after the first attempt succeeds and if later the connection is
 * lost due to network issues.
 * @returns {Object}
 */
export function createSpotTVRemoteControlConnection({ pairingCode, retry }: {
    pairingCode?: string;
    retry: boolean;
}) {
    let initiallyConnected = false;

    return (dispatch: any, getState: any) => {
        if (remoteControlServer.hasConnection()) {
            return Promise.reject('Called to create connection while connection exists');
        }

        eventHandlerRemovers = ([
            [
                SERVICE_UPDATES.CALENDAR_REFRESH_REQUESTED,
                onCalendarRefreshRequested
            ],
            [
                SERVICE_UPDATES.CONFLICT,
                onConflict
            ],
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
        ] as Array<[string, (...args: any[]) => void]>).map(([ event, callback ]) => remoteControlServer.addListener(
            event,
            callback
        ));

        const onBeforeUnloadHandler = (event: Event) => dispatch(disconnectSpotTvRemoteControl(event));

        window.addEventListener('beforeunload', onBeforeUnloadHandler);

        eventHandlerRemovers.push(() => {
            window.removeEventListener('beforeunload', onBeforeUnloadHandler);
        });

        const backend
            = isBackendEnabled(getState())
                ? new SpotTvBackendService(getSpotServicesConfig(getState()))
                : null;

        /**
         * Callback invoked when a connect has been successfully made with
         * {@code remoteControlServer}.
         *
         * @param result - Includes information specific about the
         * connection.
         * @returns {void}
         */
        function onSuccessfulConnect(result: any) {
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
            if (roomProfile) {
                dispatch(setCustomerId(roomProfile.customerId));
            }
            dispatch(reconnectScheduleUpdate(false));

            // With push enabled it is required to re-initialize calendar after reconnect, as the polling interval is
            // usually much longer and it would take a lot of time to hide the calendar error UI.
            if (isCalendarPushEnabled(getState())) {
                calendarService.refreshCalendarEvents();
            }

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
         * @param remote - Identifying about the Spot-Remote.
         * @returns {void}
         */
        function onRemoteConnected({ id, type }: { id: string; type: string; }) {
            logger.log('Detected remote control connection', {
                id,
                type
            });

            if (type === CLIENT_TYPES.SPOT_REMOTE_PERMANENT) {
                dispatch(setIsPermanentRemotePaired(true));
            }
        }

        /**
         * Callback invoked when a Spot-Remote has disconnected to with the
         * {@code remoteControlServer}.
         *
         * @param remote - Identifying about the Spot-Remote.
         * @returns {void}
         */
        function onRemoteDisconnected({ id, type }: { id: string; type: string; }) {
            logger.log('Detected remote control disconnect', {
                id,
                type
            });

            if (type === CLIENT_TYPES.SPOT_REMOTE_PERMANENT
                && !remoteControlServer.getPermanentRemoteCount()) {
                dispatch(setIsPermanentRemotePaired(false));
            }
        }

        /**
         * Handles the calendar push notification received by the RCS.
         *
         * @returns {void}
         */
        function onCalendarRefreshRequested() {
            logger.log('calendar refresh requested');
            calendarService.refreshCalendarEvents();
        }

        /**
         * Handles the calendar push notification received by the RCS.
         *
         * @returns {void}
         */
        function onConflict() {
            logger.log('received conflict error');
            dispatch(addNotification('error', 'appStatus.tvConflict'));
        }

        /**
         * Callback invoked when {@code remoteControlServer} has been
         * disconnected from an unrecoverable error.
         *
         * @param error - The error returned by the {@code remoteControlServer}.
         * @private
         * @returns {Promise}
         */
        function onDisconnect(error: Error | string): Promise<unknown> {
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
            dispatch(setIsPermanentRemotePaired(false));

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
         * @param pairingInfo - Information necessary to establish and
         * maintain a connection to the server.
         * @param pairingInfo.jwt - The latest valid jwt for
         * communicating with other backend services.
         * @param pairingInfo.tenant - The tenant name advertised by the backend.
         * @private
         * @returns {void}
         */
        function onRegistrationChange({ jwt, tenant }: { jwt: string; tenant?: string; }) {
            dispatch(setJwt(jwt));
            dispatch(setTenant(tenant));
        }

        /**
         * Callback invoked when {@code remoteControlServer} has changed
         * the join code necessary to pair with the Spot-TV.
         *
         * @param data - An object containing the update.
         * @private
         * @returns {void}
         */
        function onRemoteJoinCodeChange({ remoteJoinCode }: { remoteJoinCode: string; }) {
            dispatch(setRemoteJoinCode(remoteJoinCode));
        }

        /**
         * Encapsulates connection logic with updating states.
         *
         * @private
         * @returns {Promise}
         */
        function doConnect(): Promise<unknown> {
            return createAsyncActionWithStates(
                dispatch,
                () => createConnection(getState(), backend, pairingCode),
                CREATE_CONNECTION,
                undefined
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
 * @param state - The Redux state.
 * @param backend - The backend instance that will be used with the RCS service.
 * @param permanentPairingCode - This one is optional and used only in the backend scenario where Spot TV
 * needs a permanent pairing code in order to connect to the service.
 * @returns Resolves with an object containing the latest
 * join code and jwt.
 */
function createConnection(
        state: RootState,
        backend: SpotTvBackendService | null,
        permanentPairingCode?: string
): Promise<any> {
    const joinCodeRefreshRate = getJoinCodeRefreshRate(state);
    const remoteControlConfiguration = getRemoteControlServerConfig(state);

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
    }).then((roomProfile: any) => {
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
    return () => Promise.all(
        remoteControlServer.disconnectAllTemporaryRemotes()
    );
}

/**
 * The action kills the Spot TV remote control service connection if one exists.
 *
 * @param event - Optionally, the event which triggered the necessity to disconnect.
 * @returns {Function}
 */
export function disconnectSpotTvRemoteControl(event?: Event) {
    return (dispatch: any) => {
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
            dispatch(setIsPermanentRemotePaired(false));
        };

        return remoteControlServer.disconnect(event)
            .then(postDisconnectCleanup, postDisconnectCleanup);
    };
}

/**
 * Makes async request to the backend and retrieves the exit password.
 *
 * @returns {Promise<?string>}
 */
export function fetchExitPassword() {
    return remoteControlServer.fetchExitPassword();
}

/**
 * Requests a new long lived pairing code be created.
 *
 * @returns {Function}
 */
export function generateLongLivedPairingCode() {
    return (dispatch: any) => remoteControlServer.generateLongLivedPairingCode()
        .then((longLivedPairingCodeInfo: any) =>
            dispatch(setLongLivedPairingCodeInfo(longLivedPairingCodeInfo)));
}

/**
 * Checks if the currently known long lived pairing code, if any, has expired,
 * and gets a new code if expired. The new code will be dispatched as an action.
 *
 * @returns {Function}
 */
export function generateLongLivedPairingCodeIfExpired() {
    return (dispatch: any, getState: any) => {
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
 * @typedef {Object} MeetingSummary
 * @property {string} meetingUrl - The full meeting's URL.
 * @property {number} duration - Duration of the meeting in seconds.
 * @property {string} error - Error summary.
 * @property {string} errorCode - Error constant.
 * @property {number} participantCount - How many participants were in the meeting(max over entire duration).
 */
interface MeetingSummary {
    duration: number;
    error: string;
    errorCode: string;
    meetingUrl: string;
    participantCount: number;
}

/**
 * Action dispatched when a meeting ends.
 *
 * @param meetingSummary - Information about the just ended meeting.
 * @returns {Object}
 */
export function setMeetingSummary(meetingSummary: MeetingSummary) {
    return {
        type: SPOT_TV_SET_MEETING_SUMMARY,
        meetingSummary
    };
}

/**
 * Action dispatched when connection either fails to establish initially or disconnects.
 *
 * @param error - The error that caused disconnect.
 * @param willRetry - The flag indicates whether or not Spot TV will make an attempt to reconnect after this
 * failure.
 * @param otherFlags - Other flag which impacts the decision on whether or not the connection will be
 * re-established after this failure.
 * @returns {Object}
 */
function spotTvConnectionFailed({ error, willRetry, ...otherFlags }: {
    error: Error | string;
    willRetry: boolean;
    [key: string]: any;
}) {
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
 * @returns {Function}
 */
export function updateSpotTVSource() {
    return () => remoteControlServer.disconnect()
        .then(() => windowHandler.reload());
}

/**
 * Redirects to the meeting route and joins a meeting.
 *
 * @param meetingNameOrUrl - It can be either just name of a conference room or a full URL.
 * @param invites - An array of invites. An invite's structure is defined by JitsiMeet's external API.
 * @param screenshare - Whether to start with the screensharing enabled.
 * @param startWithVideoMuted - Whether to start with the video muted.
 * @param meetingDisplayName - An alternative display name for the meeting, such as the event name on
 * a calendar.
 * @returns {Function}
 */
export function redirectToMeeting(meetingNameOrUrl: string, { invites, meetingDisplayName, screenshare, startWithVideoMuted }: {
    invites?: any[];
    meetingDisplayName?: string;
    screenshare?: boolean;
    startWithVideoMuted?: boolean;
}) {
    return (_dispatch: any, getState: any) => {
        const state = getState();
        const domainWhitelist = getMeetingDomainsWhitelist(state);

        let location;

        if (isValidMeetingUrl(meetingNameOrUrl, domainWhitelist)) {
            location = meetingNameOrUrl;
        } else if (isValidMeetingName(meetingNameOrUrl)) {
            location = `https://${getDefaultMeetingDomain(state)}/${meetingNameOrUrl}`;
        } else {
            logger.error(`redirectToMeeting - invalid meeting URL: ${meetingNameOrUrl}`);

            return Promise.reject();
        }

        let redirectUrl = `${ROUTES.MEETING}?location=${encodeURIComponent(location)}`;

        if (screenshare) {
            redirectUrl += '&screenshare=true';
        }

        if (invites) {
            redirectUrl += `&invites=${encodeURIComponent(JSON.stringify(invites))}`;
        }

        if (startWithVideoMuted) {
            redirectUrl += '&startWithVideoMuted=true';
        }

        if (meetingDisplayName) {
            redirectUrl += `&meetingDisplayName=${encodeURIComponent(meetingDisplayName)}`;
        }

        pushRoute(redirectUrl);

        return Promise.resolve();
    };
}
