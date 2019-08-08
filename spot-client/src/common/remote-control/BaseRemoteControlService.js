import { Emitter } from 'common/emitter';
import { logger } from 'common/logger';
import { generate8Characters, getJitterDelay } from 'common/utils';

import {
    CONNECTION_EVENTS,
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

        window.addEventListener(
            'beforeunload',
            event => {
                this.disconnect(event)
                    .catch(() => { /* swallow unload errors from bubbling up */ });
            }
        );
    }

    /**
     * @typedef {Object} RoomProfile - Public information about the Spot-TV
     * and the physical room it is hosted in.
     *
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

        if (this.xmppConnectionPromise) {
            return this.xmppConnectionPromise;
        }

        this.xmppConnection = new XmppConnection({
            configuration: this._options.serverConfig,
            onCommandReceived: this._onCommandReceived,
            onMessageReceived: this._onMessageReceived,
            onPresenceReceived: this._onPresenceReceived
        });

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
                    id: roomInfo.id,
                    name: roomInfo.name
                };

                return this.xmppConnection.joinMuc({
                    joinAsSpot,
                    jwt: backend ? backend.getJwt() : null,
                    resourceName: this._getMucResourceName(),
                    retryOnUnauthorized,
                    roomName: roomInfo.roomName,
                    roomLock: roomInfo.roomLock,
                    onDisconnect: this._onDisconnect
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
            return 'spot-tv';
        } else if (backend) {
            const prefix = backend.isPairingPermanent() ? 'remote-perm' : 'remote-temp';

            // Append a random part to allow multiple remotes per type join one XMPP MUC.
            return `${prefix}-${generate8Characters()}`;
        }

        return `remote-${generate8Characters()}`;
    }

    /**
     * Returns whether or not the error is one in which a backend request cannot
     * be completed due a serious error, like missing authentication.
     *
     * @param {Error|string} error - The error object with details about the error
     * or a string that identifies the error.
     * @returns {boolean}
     */
    isUnrecoverableRequestError(error) {
        return error === 'not-authorized'
            || error === 'connection.passwordRequired'
            || (Boolean(this._options.backend) && this._options.backend.isUnrecoverableRequestError(error));
    }

    /**
     * Callback invoked when the xmpp connection is disconnected.
     *
     * @param {string} reason - The name of the disconnect event.
     * @private
     * @returns {void}
     */
    _onDisconnect(reason) {
        if (this.isUnrecoverableRequestError(reason)
            || reason === CONNECTION_EVENTS.SERVER_DISCONNECTED) {
            this.disconnect()
                .then(() => this.emit(
                    SERVICE_UPDATES.UNRECOVERABLE_DISCONNECT, reason));

            return;
        }

        this._reconnect();
    }

    /**
     * Attempt to re-create the XMPP connection.
     *
     * @private
     * @returns {void}
     */
    _reconnect() {
        if (this._isReconnectQueued) {
            logger.warn('reconnect called while already reconnecting');

            return;
        }

        this._setReconnectQueued(true);

        // wait a little bit to retry to avoid a stampeding herd
        const jitter = getJitterDelay();

        this._previousJoinCode = this.getJoinCode() || this._previousJoinCode;

        this.disconnect()
            .catch(error => {
                logger.error(
                    'an error occurred while trying to stop the service',
                    { error }
                );
            })
            .then(() => new Promise((resolve, reject) => {
                this._reconnectTimeout = setTimeout(() => {
                    logger.log('attempting reconnect');

                    this.connect({
                        ...this._options,
                        joinCode: this._previousJoinCode
                    })
                        .then(resolve)
                        .catch(reject);
                }, jitter);
            }))
            .then(() => {
                logger.log('loaded');

                this._setReconnectQueued(false);
            })
            .catch(error => {
                logger.warn('failed to load', { error });

                this._setReconnectQueued(false);

                this._onDisconnect(error);
            });
    }

    /**
     * Stops the XMPP connection.
     *
     * @param {Object} [event] - Optionally, the event which triggered the
     * necessity to disconnect from the XMPP server.
     * @returns {Promise}
     */
    disconnect(event) {
        const backend = this._options && this._options.backend;

        if (backend) {
            backend.removeListener(
                backend.constructor.REGISTRATION_UPDATED,
                this._onBackendRegistrationUpdated
            );
        }

        const destroyPromise = this.xmppConnection
            ? this.xmppConnection.destroy(event)
            : Promise.resolve();

        return destroyPromise
            .then(() => {
                this.xmppConnection = null;
                this.xmppConnectionPromise = null;
                backend && backend.stop();
            });
    }

    /**
     * @typedef {Object} RoomInfo
     * @property {string} [name] - The name of psychical conference room
     * which has the Spot-TV.
     * @property {string} roomName - the name of the MUC room.
     * @property {string} [roomLock] - the room's password (if any).
     */
    /**
     * Converts a join code to Spot-TV connection information so it can be
     * connected to by a Spot-Remote.
     *
     * @param {string} code - The join code to exchange for connection information.
     * @returns {Promise<RoomInfo>} Resolve with join information or an error.
     */
    exchangeCode(code = '') {
        if (this._options.backend) {
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
        const backend = this._options.backend;

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
     * Helper for determining the type of the Spot client based on its jid.
     *
     * @param {string} jid - The jid which contains identifying information
     * about the client.
     * @private
     * @returns {string}
     */
    _getTypeFromResource(jid) {
        if (jid.includes('/spot-tv')) {
            return 'spot-tv';
        } else if (jid.includes('remote-perm')) {
            return 'permanent-remote';
        }

        // Both "remote-temp" and "remote-" are considered temporary.
        return 'temporary-remote';
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
     * @private
     * @returns {void}
     */
    _processMessage() {
        return;
    }

    /**
     * Updates the internal flag denoting the remote control service is
     * currently trying to re-establish an XMPP connection.
     *
     * @param {boolean} isReconnecting - Whether or not a reconnect is currently
     * happening.
     * @private
     * @returns {void}
     */
    _setReconnectQueued(isReconnecting) {
        this._isReconnectQueued = isReconnecting;

        this.emit(SERVICE_UPDATES.RECONNECT_UPDATE, { isReconnecting });
    }
}

export default BaseRemoteControlService;
