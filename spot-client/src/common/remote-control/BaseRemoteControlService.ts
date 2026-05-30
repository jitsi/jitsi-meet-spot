import { Emitter } from 'common/emitter';
import { logger } from 'common/logger';
import { generate8Characters } from 'common/utils';

import P2PSignalingBase from './P2PSignalingBase';
import {
    CLIENT_TYPES,
    CONNECTION_EVENTS,
    MESSAGES,
    SERVICE_UPDATES
} from './constants';
import XmppConnection from './xmpp-connection';

/**
 * Public information about the Spot-TV and the physical room it is hosted in.
 */
interface RoomProfile {
    countryCode?: string;
    customerId?: string;
    id?: string;
    name?: string;
}

/**
 * The XMPP MUC credentials and metadata produced by exchanging a join code.
 */
interface RoomInfo {
    countryCode?: string;
    customerId?: string;
    id?: string;
    name?: string;
    roomName: string;
    roomLock?: string;
}

/**
 * Information necessary for creating the connection.
 */
interface ConnectOptions {
    backend?: any;
    joinAsSpot?: boolean;
    joinCode?: string;
    joinCodeRefreshRate?: number;
    retryOnUnauthorized?: boolean;
    serverConfig?: any;
}

/**
 * The interface for interacting with the XMPP service which powers the
 * communication between a Spot instance and remote control instances. Both the
 * Spot instance and remote controls join the same MUC and can get messages to
 * each other.
 */
export class BaseRemoteControlService extends Emitter {
    _options?: ConnectOptions;
    _disconnecting?: boolean;
    _p2pSignaling: any;
    _listeners: Array<() => void>;
    xmppConnection: any;
    xmppConnectionPromise: Promise<RoomProfile> | null | undefined;

    /**
     * Initializes a new {@code RemoteControlService} instance.
     */
    constructor() {
        super();

        this._onBackendRegistrationUpdated = this._onBackendRegistrationUpdated.bind(this);

        this._onMessageReceived = this._onMessageReceived.bind(this);
        this._onPresenceReceived = this._onPresenceReceived.bind(this);

        this._onDisconnect = this._onDisconnect.bind(this);

        /**
         * A peer-to-peer direct signaling channel. Once established will be used to send/receive remote control
         * commands.
         *
         * @protected
         */
        this._p2pSignaling = null;

        /**
         * A collection of methods to remove XMPPConnection listeners.
         *
         * @private
         */
        this._listeners = [];
    }

    /**
     * Creates a connection to the remote control service.
     *
     * @param options - Information necessary for creating the connection.
     * @returns
     */
    connect(options: ConnectOptions): Promise<RoomProfile> {
        // Keep a cache of the initial options for reference when reconnecting.
        this._options = options;
        this._disconnecting = false;

        if (this.xmppConnectionPromise) {
            return this.xmppConnectionPromise;
        }

        this.xmppConnection = new XmppConnection({
            configuration: this._options.serverConfig,
            onCommandReceived: this._onCommandReceived,
            onMessageReceived: this._onMessageReceived,
            onPresenceReceived: this._onPresenceReceived
        });

        this._listeners.push(
            this.xmppConnection.addListener(
                XmppConnection.CALENDAR_REFRESH_REQUESTED,
                () => this.emit(SERVICE_UPDATES.CALENDAR_REFRESH_REQUESTED)));
        this._listeners.push(
            this.xmppConnection.addListener(
                XmppConnection.CONFLICT,
                () => this.emit(SERVICE_UPDATES.CONFLICT)));

        if (this._p2pSignaling) {
            logger.error('Leaked P2PSignaling instance');
        }
        this._createP2PSignaling();

        this.xmppConnectionPromise
            = this._createConnectionPromise(this._options)
                    .catch(error => this.disconnect().then(() => Promise.reject(error)));

        return this.xmppConnectionPromise;
    }

    /**
     * A method which creates the connection promise. Can be used by subclasses to extend the promise
     * with extra functionality.
     *
     * @param options - Information necessary for creating the connection.
     * @returns
     * @protected
     */
    _createConnectionPromise(options: ConnectOptions): Promise<RoomProfile> {
        const {
            backend,
            joinAsSpot,
            joinCode,
            retryOnUnauthorized
        } = options;

        let roomProfile: RoomProfile;

        return this.exchangeCode(joinCode)
            .then((roomInfo: RoomInfo) => {
                roomProfile = {
                    countryCode: roomInfo.countryCode,
                    customerId: roomInfo.customerId,
                    id: roomInfo.id,
                    name: roomInfo.name
                };

                return this.xmppConnection.joinMuc({
                    joinAsSpot,
                    getJwt: backend ? () => backend.getJwt() : null,
                    resourceName: this._getMucResourceName(),
                    retryOnUnauthorized,
                    roomName: roomInfo.roomName,
                    roomLock: roomInfo.roomLock,
                    onDisconnect: this._onDisconnect,
                    shouldAttemptReconnect: this._shouldXmppAttemptReconnect.bind(this)
                });
            })
            .then(() => {
                if (backend) {
                    backend.addListener(
                        backend.constructor.REGISTRATION_UPDATED,
                        this._onBackendRegistrationUpdated
                    );
                    backend.addListener(
                        backend.constructor.REGISTRATION_LOST,
                        this._onDisconnect
                    );
                }

                return roomProfile;
            });
    }

    /**
     * Initializes P2P signaling instance.
     *
     * @protected
     * @returns
     */
    _createP2PSignaling(): void {
        const P2PSignalingType = this._getP2PSignalingType();

        this._p2pSignaling = new P2PSignalingType({
            onSendP2PMessage: (to: string, data: any) => {
                this.xmppConnection.sendMessage(
                    to,
                    MESSAGES.REMOTE_CONTROL_P2P,
                    data
                ).catch((error: any) => logger.error('Failed to send p2p message', { error }));
            }
        }, {
            getIceServers: () => this._getP2PIceServers()
        });

        this._p2pSignaling.addListener(
            P2PSignalingBase.DATA_CHANNEL_READY_UPDATE,
            () => {
                const hasActiveP2PConnection = this._p2pSignaling?.hasActiveConnection();
                const hasActiveXmppConnection = this.xmppConnection?.isConnected();

                if (!hasActiveP2PConnection && !hasActiveXmppConnection) {
                    const isXmppReconnecting = this.xmppConnection?.isReconnecting();

                    if (isXmppReconnecting) {
                        // This will result in XMPP disconnected callback
                        this.xmppConnection.abortReconnect();
                    } else {
                        logger.log('Dropping RCS connection - no active signaling', {
                            hasActiveP2PConnection,
                            hasActiveXmppConnection,
                            isXmppReconnecting
                        });
                        this._onDisconnect('no-active-signaling');
                    }
                }
            });
    }

    /**
     * Returns a Promise which is to be resolved/rejected when the initial connection process is
     * done.
     *
     * @returns
     */
    getConnectPromise(): Promise<RoomProfile> | null | undefined {
        return this.xmppConnectionPromise;
    }

    /**
     * Returns the current join code that is necessary to establish a connection with the service.
     *
     * @abstract
     * @returns
     */
    getJoinCode(): string {
        throw new Error();
    }

    /**
     * Figures out the resource part of the MUC JID to be used.
     *
     * @returns
     * @private
     */
    _getMucResourceName(): string | undefined {
        const {
            backend,
            joinAsSpot
        } = this._options ?? {};

        if (joinAsSpot) {

            // There's no random part added to Spot TV resource part which will result in conflict error returned if
            // there's a Spot TV already in the MUC. This is expected.
            return CLIENT_TYPES.SPOT_TV;
        }

        const type = backend && backend.isPairingPermanent()
            ? CLIENT_TYPES.SPOT_REMOTE_PERMANENT
            : CLIENT_TYPES.SPOT_REMOTE_TEMPORARY;

        // Append a random part to allow multiple remotes per type join one XMPP MUC.
        return `${type}-${generate8Characters()}`;
    }

    /**
     * Returns the ICE servers to be used to establish the P2P signaling connection.
     *
     * @returns
     * @private
     */
    _getP2PIceServers(): RTCIceServer[] | undefined {
        return this.xmppConnection?.getJitsiConnection()?.xmpp?.connection?.jingle?.p2pIceConfig?.iceServers;
    }

    /**
     * Returns type of P2P signaling that's supported by the implementing subclass.
     *
     * @protected
     * @abstract
     * @returns - A class not an instance.
     */
    _getP2PSignalingType(): any {
        throw new Error('Subclass must implemented this method to return P2P signaling class');
    }

    /**
     * Returns if the error is not a serious error and if it makes sense to retry the connection using the current data.
     *
     * @param error - The error object with details about the error or a string that identifies
     * the error.
     * @returns
     */
    isRecoverableRequestError(error: Error | string): boolean {
        const isBackendUsed = Boolean(this._getBackend());

        return error !== CONNECTION_EVENTS.CLOSED_BY_SERVER
            && (isBackendUsed
                ? this._isRecoverableRequestErrorBackendImpl(error)
                : this._isRecoverableRequestErrorNoBackendImpl(error));
    }

    /**
     * The backend flow impl for {@link isRecoverableRequestError}.
     *
     * @param error - The error object with details about the error or a string that identifies
     * the error.
     * @returns
     * @private
     */
    _isRecoverableRequestErrorBackendImpl(error: Error | string): boolean {
        return this._getBackend().isRecoverableRequestError(error);
    }

    /**
     * The no backend flow impl for {@link isRecoverableRequestError}.
     *
     * @param error - The error object with details about the error or a string that identifies
     * the error.
     * @returns
     * @private
     */
    _isRecoverableRequestErrorNoBackendImpl(error: Error | string): boolean {
        return error !== 'connection.passwordRequired' && error !== 'not-authorized';
    }

    /**
     * Callback invoked when the xmpp connection is disconnected.
     *
     * @param reason - The name of the disconnect event.
     * @private
     * @returns
     */
    _onDisconnect(reason?: string): void {
        // If XMPP server is not working calling disconnect triggers onDisconnect again.
        if (!this._disconnecting) {
            this._disconnecting = true;

            this.disconnect()
                .then(() => this.emit(
                    SERVICE_UPDATES.UNRECOVERABLE_DISCONNECT, reason));
        }
    }

    /**
     * Responds to Xmpp attempting to reconnect. If there are no active p2p2
     * connections, then consider it a disconnect as there are no p2p that
     * need to be kept alive.
     *
     * @returns
     */
    _shouldXmppAttemptReconnect(): boolean {
        return Boolean(
            this._getBackend()
                && this._p2pSignaling
                && this._p2pSignaling.hasActiveConnection()
        );
    }

    /**
     * Stops the XMPP connection.
     *
     * @param event - Optionally, the event which triggered the
     * necessity to disconnect from the XMPP server.
     * @returns
     */
    disconnect(event?: any): Promise<void> {
        const backend = this._getBackend();

        if (backend) {
            backend.removeListener(
                backend.constructor.REGISTRATION_UPDATED,
                this._onBackendRegistrationUpdated
            );
        }

        if (this._p2pSignaling) {
            this._p2pSignaling.stop();
            this._p2pSignaling = null;
        }

        const destroyPromise = this.xmppConnection
            ? this.xmppConnection.destroy(event)
            : Promise.resolve();

        return destroyPromise
            .then(() => {
                this._listeners.forEach(removeListener => removeListener());
                this._listeners = [];
                this.xmppConnection = null;
                this.xmppConnectionPromise = null;
                if (backend) {
                    backend.stop();
                }
            });
    }

    /**
     * Converts a join code to Spot-TV connection information so it can be
     * connected to by a Spot-Remote.
     *
     * @param code - The join code to exchange for connection information.
     * @returns Resolve with join information or an error.
     */
    exchangeCode(code = ''): Promise<RoomInfo> {
        if (this._getBackend()) {
            return this.exchangeCodeWithBackend(code.trim());
        }

        return this.exchangeCodeWithXmpp(code.trim());
    }

    /**
     * Converts a join code into XMPP MUC credentials using a backend service.
     *
     * @param code - The join code to exchange for connection information.
     * @returns Resolve with join information or an error.
     */
    exchangeCodeWithBackend(code: string): Promise<RoomInfo> {
        logger.log('Using backend to exchange the join code');
        const backend = this._getBackend();

        return backend
            .register(code)
            .then(() => backend.getRoomInfo());
    }

    /**
     * Converts a join code into XMPP MUC credentials.
     *
     * @param _code - The join code to exchange for connection information.
     * @returns Resolve with join information or an error.
     */
    exchangeCodeWithXmpp(_code?: string): Promise<RoomInfo> {
        throw new Error('Not implemented');
    }

    /**
     * Returns whether or not there is a connection that is being established
     * or is active.
     *
     * @returns
     */
    hasConnection(): boolean {
        return Boolean(this.xmppConnection);
    }

    /**
     * Convenience getter for the backend service instance.
     *
     * @returns
     * @protected
     */
    _getBackend(): any {
        return this._options && this._options.backend;
    }

    /**
     * Helper for determining the type of the Spot client based on its jid.
     *
     * @param jid - The jid which contains identifying information
     * about the client.
     * @private
     * @returns
     */
    _getTypeFromResource(jid: string): string {
        if (jid.includes(`/${CLIENT_TYPES.SPOT_TV}`)) {
            return CLIENT_TYPES.SPOT_TV;
        } else if (jid.includes(`/${CLIENT_TYPES.SPOT_REMOTE_PERMANENT}`)) {
            return CLIENT_TYPES.SPOT_REMOTE_PERMANENT;
        }

        return CLIENT_TYPES.SPOT_REMOTE_TEMPORARY;
    }

    /**
     * Callback invoked when the backend service has updated the information
     * needed to maintain and establish a connection to the backend.
     *
     * @param pairingInfo - The new connection information.
     * @private
     * @returns
     */
    _onBackendRegistrationUpdated(pairingInfo: any): void {
        this.emit(SERVICE_UPDATES.REGISTRATION_UPDATED, pairingInfo);
    }

    /**
     * Callback invoked when receiving a command to take an action.
     *
     * @abstract
     * @private
     * @returns
     */
    _onCommandReceived(..._args: any[]): void {
        throw new Error('_onCommandReceived not implemented');
    }

    /**
     * Callback invoked when {@code XmppConnection} connection receives a
     * message that needs processing.
     *
     * @param message - The message received from another user.
     * @private
     * @returns
     */
    _onMessageReceived(
            { data, from, messageType }: { data: any; from: string | null; messageType: string | null; }): void {
        logger.log('RemoteControlService received message', { messageType });

        this._processMessage(messageType ?? '', from ?? '', data);
    }

    /**
     * Callback invoked when Spot-TV or a Spot-Remote has a status update.
     * Spot-Remotes needs to know about Spot-TV state as well as connection
     * state, and Spot-TVs need to know about Spot-Remote disconnects for
     * screensharing.
     *
     * @abstract
     * @private
     * @returns
     */
    _onPresenceReceived(..._args: any[]): void {
        throw new Error('_onPresenceReceived not implemented');
    }

    /**
     * Callback to be overridden by subclass when a new message is received.
     *
     * @param messageType - The constant which denotes the subject of
     * the message.
     * @param from - The JID of the participant sending the message.
     * @param data - Additional information attached to the message.
     * @protected
     * @returns
     */
    _processMessage(messageType: string, from: string, data: any): void {
        if (messageType === MESSAGES.REMOTE_CONTROL_P2P) {
            this._processRemoteControlP2PMessage({
                from,
                data
            });
        }
    }

    /**
     * Processing for {@link MESSAGES.REMOTE_CONTROL_P2P} message which are used to exchange offer/answer and ICE
     * candidates needed to establish a P2P signaling channel.
     *
     * @param from - The remote address from which the message has been received.
     * @param data - Any message data.
     * @protected
     * @returns
     */
    _processRemoteControlP2PMessage({ from, data }: { from: string; data: any; }): void {
        if (this._p2pSignaling) {
            this._p2pSignaling.processP2PMessage({
                data,
                from
            });
        } else {
            logger.error('Ignoring P2P message - no connection', { from });
        }
    }
}

export default BaseRemoteControlService;
