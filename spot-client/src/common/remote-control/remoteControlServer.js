import { $iq } from 'strophe.js';

import { globalDebugger } from 'common/debugging';
import { logger } from 'common/logger';
import { generateRandomString } from 'common/utils';

import { BaseRemoteControlService } from './BaseRemoteControlService';
import { MESSAGES, SERVICE_UPDATES } from './constants';

/**
 * Communication service to send updates and receive commands.
 *
 * @extends BaseRemoteControlService
 */
export class RemoteControlServer extends BaseRemoteControlService {
    /**
     * Initializes a new {@code RemoteControlServer} instance.
     */
    constructor() {
        super();

        this._nextJoinCodeUpdate = null;

        this._onCommandReceived = this._onCommandReceived.bind(this);
    }

    /**
     * Extends the connection promise with server specific functionality.
     *
     * @param {ConnectOptions} options - Information necessary for creating the connection.
     * @returns {Promise<RoomProfile>}
     * @protected
     */
    _createConnectionPromise(options) {
        return super._createConnectionPromise({
            ...options,
            retryOnUnauthorized: !options.backend
        }).then(
            roomProfile => this.refreshJoinCode()
                .then(() => roomProfile));
    }

    /**
     * Stops the XMPP connection.
     *
     * @inheritdoc
     * @override
     */
    disconnect() {
        clearTimeout(this._nextJoinCodeUpdate);

        return super.disconnect();
    }

    /**
     * Converts a join code to Spot-TV connection information so it can be connected to by
     * a Spot-Remote.
     *
     * @param {string} code - The join code to exchange for connection information.
     * @returns {Promise<RoomInfo>} Resolve with join information or an error.
     */
    exchangeCodeWithXmpp(code) {
        if (code.length === 6) {
            return Promise.resolve({
                roomName: code.substring(0, 3),
                roomLock: code.substring(3, 6)
            });
        }

        return Promise.resolve({
            // If there's no joinCode service then create a room and let the lock
            // be set later. Setting the lock on join will throw an error about
            // not being authorized..
            roomName: generateRandomString(3)
        });
    }

    /**
     * Implements a way to get the current join code to connect to this instance
     * of {@code RemoteControlServer}.
     *
     * @inheritdoc
     * @override
     */
    getJoinCode() {
        if (this._options.backend) {
            return this._options.joinCode;
        }

        const fullJid
            = this.xmppConnection && this.xmppConnection.getRoomFullJid();

        if (!fullJid) {
            return '';
        }

        const roomName = fullJid.split('@')[0];
        const roomLock = this.xmppConnection.getLock();

        return `${roomName}${roomLock}`;
    }

    /**
     * Gets next remote join code refresh interval expressed in milliseconds.
     *
     * @private
     * @returns {number}
     */
    _getNextRefreshTimeout() {
        const {
            backend,
            joinCodeRefreshRate
        } = this._options;

        return backend ? backend.getNextShortLivedPairingCodeRefresh() : joinCodeRefreshRate;
    }

    /**
     * Returns the join code that is to be used by a Spot Remote in order to be paired with this Spot TV.
     *
     * @returns {string}
     */
    getRemoteJoinCode() {
        const { backend } = this._options;

        return backend ? backend.getShortLivedPairingCode() : this.getJoinCode();
    }

    /**
     * Method invoked to generate a new join code for instances of
     * {@code RemoteControlClient} to pair with it.
     *
     * @returns {Promise<string>} Resolved when the refresh is done.
     */
    refreshJoinCode() {
        clearTimeout(this._nextJoinCodeUpdate);

        const refreshCodePromise
            = this._options.backend
                ? this.refreshJoinCodeWithBackend()
                : this.refreshJoinCodeWithXmpp();

        logger.log('Refreshing remote join code...');

        return refreshCodePromise.then(() => {
            this.emit(
                SERVICE_UPDATES.REMOTE_JOIN_CODE_CHANGE,
                { remoteJoinCode: this.getRemoteJoinCode() }
            );

            const nextRefreshTimeout = this._getNextRefreshTimeout();

            if (nextRefreshTimeout) {
                logger.log(`Scheduling next remote join code refresh after ${nextRefreshTimeout / (60 * 1000)} min.`);
                this._nextJoinCodeUpdate = setTimeout(() => {
                    this.refreshJoinCode();
                }, nextRefreshTimeout);
            } else {
                logger.warn('Remote join code will not be refreshed');
            }
        });
    }

    /**
     * The backend way for refreshing remote join codes.
     *
     * @returns {Promise} - A Promise resolved when the code has been refreshed.
     */
    refreshJoinCodeWithBackend() {
        const { backend } = this._options;

        return backend.fetchShortLivedPairingCode();
    }

    /**
     * The XMPP way for refreshing remote join codes.
     *
     * @returns {Promise} - A Promise resolved when the code has been refreshed.
     */
    refreshJoinCodeWithXmpp() {
        const roomLock = generateRandomString(3);

        return this.xmppConnection.setLock(roomLock);
    }

    /**
     * Sends a message to a {@code RemoteControlClient}.
     *
     * @param {string} jid - The jid of the {@code RemoteControlClient} which
     * should receive the message.
     * @param {Object} data - Information to pass to {@code RemoteControlClient}.
     * @returns {Promise}
     */
    sendMessageToRemoteControl(jid, data) {
        return this.xmppConnection.sendMessage(
            jid, MESSAGES.JITSI_MEET_UPDATE, data);
    }

    /**
     * Update self presence for all {@code RemoteControlClient} to be notified.
     *
     * @param {Object} newStatus - The new presence object that should be merged
     * with existing presence.
     * @returns {void}
     */
    updateStatus(newStatus = {}) {
        // FIXME: these truthy checks also fix a condition where updateStatus
        // is fired when the redux store is initialized.
        if (!this.xmppConnection) {
            return;
        }

        this.xmppConnection.updateStatus(newStatus);
    }

    /**
     * Emits an event that a message or command has been received from an
     * instance of {@code RemoteControlClient}.
     *
     * @param {string} messageType - The constant of the message or command.
     * @param {Object} data - Additional details about the message.
     * @private
     * @returns {void}
     */
    _notifySpotRemoteMessageReceived(messageType, data) {
        this.emit(
            SERVICE_UPDATES.CLIENT_MESSAGE_RECEIVED,
            messageType,
            data
        );
    }

    /**
     * Callback invoked when {@code RemoteControlServer} receives a command to
     * take an action from a {@code RemoteControlClient}.
     *
     * @inheritdoc
     * @override
     */
    _onCommandReceived({ commandType, data }) {
        logger.log('RemoteControlServer received command', { commandType });

        this._notifySpotRemoteMessageReceived(commandType, data);
    }


    /**
     * Callback invoked when the XMPP connection is disconnected.
     *
     * @inheritdoc
     * @override
     */
    _onDisconnect(...args) {
        clearTimeout(this._nextJoinCodeUpdate);

        super._onDisconnect(...args);
    }

    /**
     * Implements {@link BaseRemoteControlService#_onPresenceReceived}.
     *
     * @inheritdoc
     */
    _onPresenceReceived({ from, type }) {
        if (type === 'unavailable') {
            logger.log('presence update of a Spot-Remote leaving', { from });

            // A {@code RemoteControlServer} needs to inform at least the
            // Jitsi-Meet meeting that a {@code RemoteControlClient} has left,
            // in case some cleanup of wireless screensharing is needed.
            const iq = $iq({ type: 'set' })
                .c('jingle', {
                    xmlns: 'urn:xmpp:jingle:1',
                    action: 'unavailable'
                })
                .c('details')
                .t('unavailable')
                .up();

            this._notifySpotRemoteMessageReceived(
                MESSAGES.CLIENT_LEFT,
                {
                    from,
                    data: { iq: iq.toString() }
                }
            );

            return;
        }
    }

    /**
     * Relays messages from Jitsi-Meet to the {@code RemoteControlClient}.
     *
     * @override
     * @inheritdoc
     */
    _processMessage(messageType, from, data) {
        switch (messageType) {
        case MESSAGES.REMOTE_CONTROL_UPDATE:
            // {@code RemoteControlServer} received a message from a
            // {@code RemoteControlClient} to send to the Jitsi-Meet participant.
            this._notifySpotRemoteMessageReceived(
                MESSAGES.CLIENT_PROXY_MESSAGE,
                {
                    data,
                    from
                }
            );

            break;
        }
    }
}

const remoteControlServer = new RemoteControlServer();

globalDebugger.register('remoteControlServer', remoteControlServer);

export default remoteControlServer;
