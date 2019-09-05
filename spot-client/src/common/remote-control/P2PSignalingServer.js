import { logger } from 'common/logger';
import P2PSignalingBase from './P2PSignalingBase';

/**
 * Peer to peer signalling channel for Spot TV(server). Will process remote control commands
 */
export default class P2PSignalingServer extends P2PSignalingBase {
    /**
     * Spot TV processing for data channels messages received over P2P data channel.
     * It processes remote control command and sends ack responses when done.
     *
     * @param {string} remoteAddress - The remote address from which the message has been received.
     * @param {string} rawData - Raw message data as string.
     * @private
     * @returns {void}
     */
    _onDataChannelMessage(remoteAddress, rawData) {
        let msg;

        try {
            msg = JSON.parse(rawData);
        } catch (error) {
            logger.error('Failed to parse P2P message', {
                rawData,
                error
            });

            return;
        }

        const { command, data, requestId } = msg;

        if (requestId && command && data) {
            this._callbacks.onRemoteControlMessageReceived({
                remoteAddress,
                requestId,
                command,
                data
            });
        } else {
            logger.warn('_onDataChannelMessage ignoring a msg', { rawData });
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
}
