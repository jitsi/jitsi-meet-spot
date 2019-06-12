import { $iq } from 'strophe.js';

import { Emitter } from 'common/emitter';
import { logger } from 'common/logger';
import { getJitterDelay } from 'common/utils';

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

        this._onMessageReceived = this._onMessageReceived.bind(this);
        this._onPresenceReceived = this._onPresenceReceived.bind(this);

        this._onDisconnect = this._onDisconnect.bind(this);

        window.addEventListener(
            'beforeunload',
            () => this.disconnect()
                .catch(() => { /* swallow unload errors from bubbling up */ })
        );
    }

    /**
     * Creates a connection to the remote control service.
     *
     * @param {Object} options - Information necessary for creating the MUC.
     * @param {boolean} options.joinAsSpot - Whether or not this connection is
     * being made by a Spot client.
     * @param {string} options.joinCode - The code to use when joining or to set
     * when creating a new MUC.
     * @param {SpotBackendService} [options.backend] - The optional backend service if configured.
     * @param {number} [options.joinCodeRefreshRate] - A duration in
     * milliseconds. If provided, a join code will be created and an interval
     * created to automatically update the join code at the provided rate.
     * @param {Object} options.serverConfig - Details on how the XMPP connection
     * should be made.
     * @returns {Promise<string>}
     */
    connect(options) {
        // Keep a cache of the initial options for reference when reconnecting.
        this._options = options;

        const {
            backend,
            joinAsSpot,
            joinCode,
            retryOnUnauthorized,
            serverConfig
        } = this._options;

        if (this.xmppConnectionPromise) {
            return this.xmppConnectionPromise;
        }

        this.xmppConnection = new XmppConnection({
            configuration: serverConfig,
            onCommandReceived: this._onCommandReceived,
            onMessageReceived: this._onMessageReceived,
            onPresenceReceived: this._onPresenceReceived
        });

        let roomProfile;

        this.xmppConnectionPromise = this.exchangeCode(joinCode)
            .then(roomInfo => {
                roomProfile = { name: roomInfo.name };

                return this.xmppConnection.joinMuc({
                    joinAsSpot,
                    jwt: backend ? backend.getJwt() : null,
                    retryOnUnauthorized,
                    roomName: roomInfo.roomName,
                    roomLock: roomInfo.roomLock,
                    onDisconnect: this._onDisconnect
                });
            })
            .catch(error => this.disconnect().then(() => Promise.reject(error)))
            .then(() => roomProfile);

        return this.xmppConnectionPromise;
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
     * Callback invoked when the xmpp connection is disconnected.
     *
     * @param {string} reason - The name of the disconnect event.
     * @private
     * @returns {void}
     */
    _onDisconnect(reason) {
        if (reason === CONNECTION_EVENTS.SERVER_DISCONNECTED
            || reason === 'not-authorized') {
            this.disconnect()
                .then(() => this.emit(
                    SERVICE_UPDATES.UNRECOVERABLE_DISCONNECT, { reason }));

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
     * @returns {void}
     */
    disconnect() {
        const destroyPromise = this.xmppConnection
            ? this.xmppConnection.destroy()
            : Promise.resolve();

        return destroyPromise
            .then(() => {
                this.xmppConnection = null;
                this.xmppConnectionPromise = null;
            });
    }

    /**
     * @typedef {Object} RoomInfo
     * @property {string} roomName - the name of the room.
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
     * Callback invoked when receiving a command to take an action.
     *
     * @abstract
     * @param {Object} iq -  The XML document representing the iq with the
     * command.
     * @private
     * @returns {Object} An ack of the iq.
     */
    _onCommandReceived() {
        throw new Error('_onCommandReceived not implemented');
    }

    /**
     * Callback invoked when {@code XmppConnection} connection receives a
     * message iq that needs processing.
     *
     * @param {Object} iq - The XML document representing the iq with the
     * message.
     * @private
     * @returns {Object} An ack of the iq.
     */
    _onMessageReceived(iq) {
        const from = iq.getAttribute('from');
        const message = iq.getElementsByTagName('message')[0];
        const messageType = message.getAttribute('type');

        logger.log('RemoteControlService received message', { messageType });

        let data;

        try {
            data = JSON.parse(message.textContent);
        } catch (e) {
            logger.error('Failed to parse message data');

            data = {};
        }

        this._processMessage(messageType, from, data);

        return $iq({
            id: iq.getAttribute('id'),
            to: from,
            type: 'result'
        });
    }

    /**
     * Callback invoked when Spot-TV or a Spot-Remote has a status update.
     * Spot-Remotes needs to know about Spot-TV state as well as connection
     * state, and Spot-TVs need to know about Spot-Remote disconnects for
     * screensharing.
     *
     * @abstract
     * @param {Object} presence - The XML document representing the presence
     * update.
     * @private
     * @returns {Promise}
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
