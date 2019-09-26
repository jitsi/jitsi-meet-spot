import { logger } from 'common/logger';
import P2PSignalingBase from './P2PSignalingBase';

/**
 * Peer to peer signalling channel for Spot TV(server). Will process remote control commands.
 */
export default class P2PSignalingServer extends P2PSignalingBase {
    /**
     * Event fired when remote control command(see {@link COMMANDS}) has been received over P2P data channel from Spot
     * Remote. The Spot TV is supposed to send an ACK message back using {@link sendCommandAck} after the command has
     * been processed.
     *
     * @type {string}
     */
    static REMOTE_CONTROL_CMD_RECEIVED = 'REMOTE_CONTROL_CMD_RECEIVED';

    /**
     * Spot TV processing for data channels messages received over P2P data channel.
     * It processes remote control command and sends ack responses when done.
     *
     * @param {string} remoteAddress - The remote address from which the message has been received.
     * @param {Object} msg - JSON object received in message content.
     * @private
     * @returns {void}
     */
    _processDataChannelMessage(remoteAddress, msg) {
        const { command, data, requestId } = msg;

        if (requestId && command && data) {
            this.emit(P2PSignalingServer.REMOTE_CONTROL_CMD_RECEIVED, {
                remoteAddress,
                requestId,
                command,
                data
            });
        } else {
            super._processDataChannelMessage(remoteAddress, msg);
        }
    }

    /**
     * Method to be called by the RCS service when a command received over the P2P data chanel has been process or
     * acknowledged.
     *
     * @param {string} remoteAddress - The remote address to which an ack wil be sent to.
     * @param {number} requestId - The request ID to be acknowledged.
     * @returns {void}
     */
    sendCommandAck(remoteAddress, requestId) {
        const connection = this.getConnectionForAddress(remoteAddress);
        const isActive = Boolean(connection && connection.isDataChannelActive());

        if (isActive) {
            connection.sendDataChannelMessage(
                JSON.stringify({
                    command: 'ack',
                    requestId
                }));
        } else {
            logger.warn('Skipped sending P2P cmd ack', {
                remoteAddress,
                requestId,
                hasConnection: Boolean(connection),
                isDataChannelActive: isActive
            });
        }
    }

    /**
     * Updates the current Spot TV's status, which should notify other participants of the update. This is a fire and
     * forget call with no ack.
     *
     * @param {Object} newStatus - The new TV status to be broadcasted over to all Spot Remotes.
     * @returns {void}
     */
    updateStatus(newStatus = {}) {
        const updateMsg = JSON.stringify({
            command: 'status',
            newStatus
        });

        for (const peerConnection of this._peerConnections.values()) {
            if (peerConnection.isDataChannelActive()) {
                peerConnection.sendDataChannelMessage(updateMsg);
            }
        }
    }
}
