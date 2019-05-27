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
     * Creates a connection to XMPP service used for communication between
     * server and remotes.
     *
     * @inheritdoc
     */
    connect(options) {
        if (this.hasConnection()) {
            return this.xmppConnectionPromise;
        }

        const connectionPromise = super.connect(options);

        connectionPromise
            .then(() => {
                if (options.joinCodeRefreshRate) {
                    this.refreshJoinCode(options.joinCodeRefreshRate);
                }
            });

        return connectionPromise;
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
     * Implements a way to get the current join code to connect to this instance
     * of {@code RemoteControlServer}.
     *
     * @inheritdoc
     * @override
     */
    getJoinCode() {
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
     * Method invoked to generate a new join code for instances of
     * {@code RemoteControlClient} to pair with it.
     *
     * @param {number} nextRefreshTimeout - If defined will start an interval
     * to automatically update join code.
     * @returns {Promise<string>} Resolves with the new join code.
     */
    refreshJoinCode(nextRefreshTimeout) {
        clearTimeout(this._nextJoinCodeUpdate);

        const roomLock = generateRandomString(3);

        this.xmppConnection.setLock(roomLock)
            .then(() => {
                this.emit(
                    SERVICE_UPDATES.JOIN_CODE_CHANGE,
                    { joinCode: this.getJoinCode() }
                );

                if (nextRefreshTimeout) {
                    this._nextJoinCodeUpdate = setTimeout(() => {
                        this.refreshJoinCode(nextRefreshTimeout);
                    }, nextRefreshTimeout);
                }
            });
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
    _onCommandReceived(iq) {
        const from = iq.getAttribute('from');
        const command = iq.getElementsByTagName('command')[0];
        const commandType = command.getAttribute('type');

        logger.log('RemoteControlServer received command', { commandType });

        let data;

        try {
            data = JSON.parse(command.textContent);
        } catch (e) {
            logger.error('Failed to parse command data');

            data = {};
        }

        this._notifySpotRemoteMessageReceived(commandType, data);

        return $iq({
            id: iq.getAttribute('id'),
            type: 'result',
            to: from
        });
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
    _onPresenceReceived(presence) {
        const updateType = presence.getAttribute('type');

        if (updateType === 'unavailable') {
            const from = presence.getAttribute('from');

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
