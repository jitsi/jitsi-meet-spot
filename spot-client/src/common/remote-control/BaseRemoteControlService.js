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
 * The interface for interacting with the XMPP service which powers the
 * communication between a Spot instance and remote control instances. Both the
 * Spot instance and remote controls join the same MUC and can get messages to
 * each other.
 */
export class BaseRemoteControlService extends Emitter {
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
         * @type {P2PSignalingClient|P2PSignalingServer|null}
         * @protected
         */
        this._p2pSignaling = null;

        /**
         * A collection of methods to remove XMPPConnection listeners.
         *
         * @type {Array<Function>}
         * @private
         */
        this._listeners = [];
    }

    /**
     * @typedef {Object} RoomProfile - Public information about the Spot-TV
     * and the physical room it is hosted in.
     *
     * @property {string} [countryCode] - ISO 3166-1 alpha-2 country code for the room's location.
     * @property {string} [customerId] - The customer ID assigned for the room's owner.
     * @property {string} [id] - The room ID.
     * @property {string} [name] - The name of psychical conference room
     * which has the Spot-TV.
     */

    /**
     * @typedef {Object} ConnectOptions
     * @property {boolean} options.joinAsSpot - Whether or not this connection is
     * being made by a Spot client.
     * @property {string} options.joinCode - The code to use when joining or to set
     * when creating a new MUC.
     * @property {SpotBackendService} [options.backend] - The optional backend service if configured.
     * @property {number} [options.joinCodeRefreshRate] - A duration in
     * milliseconds. If provided, a join code will be created and an interval
     * created to automatically update the join code at the provided rate.
     * @property {Object} options.serverConfig - Details on how the XMPP connection
     * should be made.
     */
    /**
     * Creates a connection to the remote control service.
     *
     * @param {ConnectOptions} options - Information necessary for creating the connection.
     * @returns {Promise<RoomProfile>}
     */
    connect(options) {
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

        !this._p2pSignaling || logger.error('Leaked P2PSignaling instance');
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
     * @param {ConnectOptions} options - Information necessary for creating the connection.
     * @returns {Promise<RoomProfile>}
     * @protected
     */
    _createConnectionPromise(options) {
        const {
            backend,
            joinAsSpot,
            joinCode,
            retryOnUnauthorized
        } = options;

        let roomProfile;

        return this.exchangeCode(joinCode)
            .then(roomInfo => {
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
     * @returns {void}
     */
    _createP2PSignaling() {
        const P2PSignalingType = this._getP2PSignalingType();

        this._p2pSignaling = new P2PSignalingType({
            onSendP2PMessage: (to, data) => {
                this.xmppConnection.sendMessage(
                    to,
                    MESSAGES.REMOTE_CONTROL_P2P,
                    data
                ).catch(error => logger.error('Failed to send p2p message', { error }));
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
     * @returns {Promise}
     */
    getConnectPromise() {
        return this.xmppConnectionPromise;
    }

    /**
     * Returns the current join code that is necessary to establish a connection with the service.
     *
     * @abstract
     * @returns {string}
     */
    getJoinCode() {
        throw new Error();
    }

    /**
     * Figures out the resource part of the MUC JID to be used.
     *
     * @returns {string|undefined}
     * @private
     */
    _getMucResourceName() {
        const {
            backend,
            joinAsSpot
        } = this._options;

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
     * @returns {?Array<RTCIceServer>}
     * @private
     */
    _getP2PIceServers() {
        return this.xmppConnection?.getJitsiConnection()?.xmpp?.connection?.jingle?.p2pIceConfig?.iceServers;
    }

    /**
     * Returns type of P2P signaling that's supported by the implementing subclass.
     *
     * @protected
     * @abstract
     * @returns {P2PSignalingServer|P2PSignalingClient} - A class not an instance.
     */
    _getP2PSignalingType() {
        throw new Error('Subclass must implemented this method to return P2P signaling class');
    }

    /**
     * Returns if the error is not a serious error and if it makes sense to retry the connection using the current data.
     *
     * @param {Error|string} error - The error object with details about the error or a string that identifies
     * the error.
     * @returns {boolean}
     */
    isRecoverableRequestError(error) {
        const isBackendUsed = Boolean(this._getBackend());

        return error !== CONNECTION_EVENTS.CLOSED_BY_SERVER
            && (isBackendUsed
                ? this._isRecoverableRequestErrorBackendImpl(error)
                : this._isRecoverableRequestErrorNoBackendImpl(error));
    }

    /**
     * The backend flow impl for {@link isRecoverableRequestError}.
     *
     * @param {Error|string} error - The error object with details about the error or a string that identifies
     * the error.
     * @returns {boolean}
     * @private
     */
    _isRecoverableRequestErrorBackendImpl(error) {
        return this._getBackend().isRecoverableRequestError(error);
    }

    /**
     * The no backend flow impl for {@link isRecoverableRequestError}.
     *
     * @param {Error|string} error - The error object with details about the error or a string that identifies
     * the error.
     * @returns {boolean}
     * @private
     */
    _isRecoverableRequestErrorNoBackendImpl(error) {
        return error !== 'connection.passwordRequired' && error !== 'not-authorized';
    }

    /**
     * Callback invoked when the xmpp connection is disconnected.
     *
     * @param {string} reason - The name of the disconnect event.
     * @private
     * @returns {void}
     */
    _onDisconnect(reason) {
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
     * @returns {boolean}
     */
    _shouldXmppAttemptReconnect() {
        return Boolean(
            this._getBackend()
                && this._p2pSignaling
                && this._p2pSignaling.hasActiveConnection()
        );
    }

    /**
     * Stops the XMPP connection.
     *
     * @param {Object} [event] - Optionally, the event which triggered the
     * necessity to disconnect from the XMPP server.
     * @returns {Promise}
     */
    disconnect(event) {
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
                backend && backend.stop();
            });
    }

    /**
     * @typedef {Object} RoomInfo
     * @property {string} [countryCode] - ISO 3166-1 alpha-2 country code for the room's location.
     * @property {string} [customerId] - THe customer ID assigned by the backend for the room's owner.
     * @property {string} [name] - The name of psychical conference room
     * which has the Spot-TV.
     * @property {string} roomName - The name of the MUC room.
     * @property {string} [roomLock] - The room's password (if any).
     */
    /**
     * Converts a join code to Spot-TV connection information so it can be
     * connected to by a Spot-Remote.
     *
     * @param {string} code - The join code to exchange for connection information.
     * @returns {Promise<RoomInfo>} Resolve with join information or an error.
     */
    exchangeCode(code = '') {
        if (this._getBackend()) {
            return this.exchangeCodeWithBackend(code.trim());
        }

        return this.exchangeCodeWithXmpp(code.trim());
    }

    /**
     * Converts a join code into XMPP MUC credentials using a backend service.
     *
     * @param {string} code - The join code to exchange for connection information.
     * @returns {Promise<RoomInfo>} Resolve with join information or an error.
     */
    exchangeCodeWithBackend(code) {
        logger.log('Using backend to exchange the join code');
        const backend = this._getBackend();

        return backend
            .register(code)
            .then(() => backend.getRoomInfo());
    }

    /**
     * Converts a join code into XMPP MUC credentials.
     *
     * @param {string} code - The join code to exchange for connection information.
     * @returns {Promise<RoomInfo>} Resolve with join information or an error.
     */
    exchangeCodeWithXmpp() {
        throw new Error('Not implemented');
    }

    /**
     * Returns whether or not there is a connection that is being established
     * or is active.
     *
     * @returns {boolean}
     */
    hasConnection() {
        return Boolean(this.xmppConnection);
    }

    /**
     * Convenience getter for the backend service instance.
     *
     * @returns {SpotBackendService}
     * @protected
     */
    _getBackend() {
        return this._options && this._options.backend;
    }

    /**
     * Helper for determining the type of the Spot client based on its jid.
     *
     * @param {string} jid - The jid which contains identifying information
     * about the client.
     * @private
     * @returns {string}
     */
    _getTypeFromResource(jid) {
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
     * @param {Object} pairingInfo - The new connection information.
     * @param {string} pairingInfo.jwt - The latest valid jwt for
     * communicating with other backend services.
     * @private
     * @returns {void}
     */
    _onBackendRegistrationUpdated(pairingInfo) {
        this.emit(SERVICE_UPDATES.REGISTRATION_UPDATED, pairingInfo);
    }

    /**
     * Callback invoked when receiving a command to take an action.
     *
     * @abstract
     * @param {Command} command - An order received to perform an action.
     * @private
     * @returns {void}
     */
    _onCommandReceived() {
        throw new Error('_onCommandReceived not implemented');
    }

    /**
     * Callback invoked when {@code XmppConnection} connection receives a
     * message that needs processing.
     *
     * @param {Message} message - The message received from another user.
     * @private
     * @returns {void}
     */
    _onMessageReceived({ data, from, messageType }) {
        logger.log('RemoteControlService received message', { messageType });

        this._processMessage(messageType, from, data);
    }

    /**
     * Callback invoked when Spot-TV or a Spot-Remote has a status update.
     * Spot-Remotes needs to know about Spot-TV state as well as connection
     * state, and Spot-TVs need to know about Spot-Remote disconnects for
     * screensharing.
     *
     * @abstract
     * @param {Presence} presence - The XML presence parsed into a plain object.
     * @private
     * @returns {void}
     */
    _onPresenceReceived() {
        throw new Error('_onPresenceReceived not implemented');
    }

    /**
     * Callback to be overridden by subclass when a new message is received.
     *
     * @param {string} messageType - The constant which denotes the subject of
     * the message.
     * @param {string} from - The JID of the participant sending the message.
     * @param {Object} data - Additional information attached to the message.
     * @protected
     * @returns {void}
     */
    _processMessage(messageType, from, data) {
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
     * @param {string} from - The remote address from which the message has been received.
     * @param {string} data - Any message data.
     * @protected
     * @returns {void}
     */
    _processRemoteControlP2PMessage({ from, data }) {
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
