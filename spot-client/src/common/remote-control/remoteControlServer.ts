
import { globalDebugger } from 'common/debugging';
import { logger } from 'common/logger';
import { generateRandomString } from 'common/utils';
import { $iq } from 'strophe.js';

import { BaseRemoteControlService } from './BaseRemoteControlService';
import P2PSignalingServer from './P2PSignalingServer';
import { CLIENT_TYPES, MESSAGES, SERVICE_UPDATES } from './constants';

/**
 * Communication service to send updates and receive commands.
 */
export class RemoteControlServer extends BaseRemoteControlService {
    _nextJoinCodeUpdate: ReturnType<typeof setTimeout> | null;
    msgId: number;

    /**
     * Initializes a new {@code RemoteControlServer} instance.
     */
    constructor() {
        super();

        this._nextJoinCodeUpdate = null;

        this._onCommandReceived = this._onCommandReceived.bind(this);

        // Start message IDs as a 'random' number to avoid conflicts.
        this.msgId = Date.now();
    }

    /**
     * Extends the connection promise with server specific functionality.
     *
     * @param options - Information necessary for creating the connection.
     * @returns Promise<RoomProfile>
     * @protected
     */
    _createConnectionPromise(options: any): Promise<any> {
        return super._createConnectionPromise({
            ...options,
            retryOnUnauthorized: !options.backend
        }).then((roomProfile: any) => this.refreshJoinCode().then(() => roomProfile));
    }

    /**
     * Initializes P2P signaling instance.
     *
     * @protected
     * @returns {void}
     */
    _createP2PSignaling(): void {
        super._createP2PSignaling();

        this._p2pSignaling.addListener(P2PSignalingServer.REMOTE_CONTROL_CMD_RECEIVED, (cmdObj: any) => {
            this._onP2PRemoteControlCommandReceived(cmdObj);
        });
    }

    /**
     * Stops the XMPP connection.
     *
     * @inheritdoc
     * @override
     */
    disconnect(event?: any): Promise<any> {
        if (this._nextJoinCodeUpdate) {
            clearTimeout(this._nextJoinCodeUpdate);
        }

        return super.disconnect(event);
    }

    /**
     * Converts a join code to Spot-TV connection information so it can be connected to by
     * a Spot-Remote.
     *
     * @param code - The join code to exchange for connection information.
     * @returns Promise<RoomInfo> Resolve with join information or an error.
     */
    exchangeCodeWithXmpp(code: string): Promise<any> {
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
            roomName: generateRandomString(3).toLowerCase()
        });
    }

    /**
     * Retrieves the exit password(if any).
     *
     * @returns - Resolved either with a password or 'undefined' if there isn't any.
     */
    fetchExitPassword(): Promise<string | undefined> {
        const backend = this._getBackend();

        return backend ? backend.fetchExitPassword() : Promise.resolve(undefined);
    }

    /**
     * Returns a pairing code which can be used to set up "permanent" pairing
     * of a Spot-Remote to a Spot-TV.
     *
     * @returns Resolves with information about the pairing
     * code.
     */
    generateLongLivedPairingCode(): Promise<any> {
        const backend = this._getBackend();

        if (!backend) {
            return Promise.reject('no backend configured');
        }

        return backend.generateLongLivedPairingCode();
    }

    /**
     * Implements a way to get the current join code to connect to this instance
     * of {@code RemoteControlServer}.
     *
     * @inheritdoc
     * @override
     */
    getJoinCode(): string {
        if (this._getBackend()) {
            return this._options?.joinCode ?? '';
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
     * Disconnects a remote control client from the remote control server.
     *
     * @param jid - The id associated with the client to be removed.
     * @returns {Promise}
     */
    disconnectRemoteControl(jid: string): Promise<any> {
        logger.log('Kicking out remote control', { jid });

        return this.xmppConnection.kick(jid);
    }

    /**
     * Disconnects temporary remote controls.
     *
     * @returns Promises for kicking out each temporary remote
     * control.
     */
    disconnectAllTemporaryRemotes(): Array<Promise<any>> {
        return Array.from(this.xmppConnection.getParticipantJids())
            .reduce((acc: Array<Promise<any>>, jid: any) => {
                if (this._getTypeFromResource(jid) === CLIENT_TYPES.SPOT_REMOTE_TEMPORARY) {
                    acc.push(this.disconnectRemoteControl(jid));
                }

                return acc;
            }, []);
    }

    /**
     * Returns how many permanent remotes are currently connected via XMPP.
     *
     * @returns The count of permanent remotes connected to the TV.
     */
    getPermanentRemoteCount(): number {
        return Array.from(this.xmppConnection.getParticipantJids())
            .reduce((acc: number, jid: any) => {
                if (this._getTypeFromResource(jid) === CLIENT_TYPES.SPOT_REMOTE_PERMANENT) {
                    return acc + 1;
                }

                return acc;
            }, 0);
    }

    /**
     * Gets next remote join code refresh interval expressed in milliseconds.
     *
     * @private
     * @returns {number}
     */
    _getNextRefreshTimeout(): number | undefined {
        const {
            backend,
            joinCodeRefreshRate
        } = this._options ?? {};

        return backend ? backend.getNextShortLivedPairingCodeRefresh() : joinCodeRefreshRate;
    }

    /**
     * Returns the type of P2P signaling supported by RCS server.
     *
     * @returns {P2PSignalingServer}
     * @private
     */
    _getP2PSignalingType(): typeof P2PSignalingServer {
        return P2PSignalingServer;
    }

    /**
     * Returns the join code that is to be used by a Spot Remote in order to be paired with this Spot TV.
     *
     * @returns {string}
     */
    getRemoteJoinCode(): string {
        const { backend } = this._options ?? {};

        return backend ? backend.getShortLivedPairingCode() : this.getJoinCode();
    }

    /**
     * Method invoked to generate a new join code for instances of
     * {@code RemoteControlClient} to pair with it.
     *
     * @returns Resolved when the refresh is done.
     */
    refreshJoinCode(): Promise<void> {
        if (this._nextJoinCodeUpdate) {
            clearTimeout(this._nextJoinCodeUpdate);
        }

        const refreshCodePromise
            = this._getBackend()
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
     * @returns - A Promise resolved when the code has been refreshed.
     */
    refreshJoinCodeWithBackend(): Promise<any> {
        const { backend } = this._options ?? {};

        return backend.fetchShortLivedPairingCode();
    }

    /**
     * The XMPP way for refreshing remote join codes.
     *
     * @returns - A Promise resolved when the code has been refreshed.
     */
    refreshJoinCodeWithXmpp(): Promise<any> {
        const roomLock = generateRandomString(3).toLowerCase();

        return this.xmppConnection.setLock(roomLock);
    }

    /**
     * Sends a message to a {@code RemoteControlClient}.
     *
     * @param jid - The jid of the {@code RemoteControlClient} which
     * should receive the message.
     * @param data - Information to pass to {@code RemoteControlClient}.
     * @returns {Promise}
     */
    sendMessageToRemoteControl(jid: string, data: any): Promise<any> {
        return this.xmppConnection.sendMessage(
            jid, MESSAGES.JITSI_MEET_UPDATE, data);
    }

    /**
     * Update self presence for all {@code RemoteControlClient} to be notified.
     *
     * @param newStatus - The new presence object that should be merged
     * with existing presence.
     * @returns {void}
     */
    updateStatus(newStatus: any = {}): void {
        // FIXME: these truthy checks also fix a condition where updateStatus
        // is fired when the redux store is initialized.
        if (!this.xmppConnection) {
            return;
        }

        newStatus.timestamp = Date.now();

        // In the current iteration the same status message is sent both over XMPP and P2P,
        // so to avoid it being processed again we add a unique id to it that the client can use
        // to ignore duplicates.
        newStatus.msgId = this.msgId++;

        this.xmppConnection.updateStatus(newStatus);

        if (this._p2pSignaling) {
            this._p2pSignaling.updateStatus(newStatus);
        }
    }

    /**
     * Emits an event that a message or command has been received from an
     * instance of {@code RemoteControlClient}.
     *
     * @param messageType - The constant of the message or command.
     * @param data - Additional details about the message.
     * @private
     * @returns {void}
     */
    _notifySpotRemoteMessageReceived(messageType: string, data: any): void {
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
    _onCommandReceived({ commandType, data }: { commandType: string; data: any; }): void {
        logger.log('RemoteControlServer received command', { commandType });

        this._notifySpotRemoteMessageReceived(commandType, data);
    }

    /**
     * Method called when a remote control command is received over the P2P channel.
     *
     * @param remoteAddress - The remote address to which an ack needs to be sent to.
     * @param requestId - The request ID to be used for an ack.
     * @param command - A remote control service command.
     * @param data - Any command specific extra data(if any).
     * @protected
     * @returns {void}
     */
    _onP2PRemoteControlCommandReceived(
            { remoteAddress, requestId, command, data }:
            { remoteAddress: string; requestId: number; command: string; data: any; }): void {
        this._notifySpotRemoteMessageReceived(command, data);

        if (this._p2pSignaling) {
            this._p2pSignaling.sendCommandAck(remoteAddress, requestId);
        } else {
            logger.warn('Skipped sending P2P command ack - no P2P connection', {
                remoteAddress,
                requestId,
                command
            });
        }
    }


    /**
     * Callback invoked when the XMPP connection is disconnected.
     *
     * @inheritdoc
     * @override
     */
    _onDisconnect(...args: any[]): void {
        if (this._nextJoinCodeUpdate) {
            clearTimeout(this._nextJoinCodeUpdate);
        }

        super._onDisconnect(...args);
    }

    /**
     * Implements {@link BaseRemoteControlService#_onPresenceReceived}.
     *
     * @inheritdoc
     */
    _onPresenceReceived({ from, localUpdate, type }: { from: string; localUpdate?: boolean; type: string; }): void {
        if (localUpdate) {
            return;
        }

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

            this.emit(
                SERVICE_UPDATES.CLIENT_LEFT,
                {
                    id: from,
                    type: this._getTypeFromResource(from)
                }
            );

            return;
        }

        if (type === 'join') {
            logger.log('presence update of a Spot-Remote joining', { from });

            this.emit(
                SERVICE_UPDATES.CLIENT_JOINED,
                {
                    id: from,
                    type: this._getTypeFromResource(from)
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
    _processMessage(messageType: string, from: string, data: any): void {
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
        default:
            super._processMessage(messageType, from, data);
            break;
        }
    }
}

const remoteControlServer = new RemoteControlServer();

globalDebugger.register('remoteControlServer', remoteControlServer);

export default remoteControlServer;
