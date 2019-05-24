import { globalDebugger } from 'common/debugging';
import { generateRandomString } from 'common/utils';

import { BaseRemoteControlService } from './BaseRemoteControlService';
import { MESSAGES, SERVICE_UPDATES } from './constants';

/**
 * Communication service for the Spot-TV to talk to Spot-Remote.
 *
 * @extends BaseRemoteControlService
 */
export class SpotTvRemoteControlService extends BaseRemoteControlService {
    /**
     * Initializes a new {@code SpotTvRemoteControlService} instance.
     */
    constructor() {
        super();

        this._nextJoinCodeUpdate = null;
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
     * Implements a way to get the current join code to connect to this Spot-TV
     * instance.
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
     * Method invoked by Spot-TV to generate a new join code for a Spot-Remote
     * to pair with it.
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
     * Sends a message to a Spot-Remote.
     *
     * @param {string} jid - The jid of the remote control which should receive
     * the message.
     * @param {Object} data - Information to pass to the remote control.
     * @returns {Promise}
     */
    sendMessageToRemoteControl(jid, data) {
        return this.xmppConnection.sendMessage(
            jid, MESSAGES.JITSI_MEET_UPDATE, data);
    }

    /**
     * To be called by Spot-TV to update self presence.
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
}

const remoteControlService = new SpotTvRemoteControlService();

globalDebugger.register('spotTvRemoteControlService', remoteControlService);

export default remoteControlService;
