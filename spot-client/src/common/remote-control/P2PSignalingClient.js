import { logger } from 'common/logger';

import { generate8Characters } from '../utils';

import P2PSignalingBase from './P2PSignalingBase';


/**
 * A P2P signaling client which exposes method for sending remote control commands and is to be used by a Spot Remote.
 */
export default class P2PSignalingClient extends P2PSignalingBase {
    /**
     * Events fired when Spot TV status update is received over the P2P data channel. As an argument it will pass
     * Spot TV's remote address and the entire TV state object.
     * @type {string}
     */
    static SPOT_TV_STATUS_UPDATE = 'SPOT_TV_STATUS_UPDATE';

    /**
     * Creates new instance.
     *
     * @param {P2PSignalingCallbacks} callbacks - See type description for more info.
     * @param {P2PSignalingOptions} options - See type description for more info.
     */
    constructor(callbacks, options) {
        super(callbacks, options);

        /**
         * @typedef {Object} PromiseLike
         * @property {Function} resolve - hooked up to Promise's resolve method.
         * @property {Function} reject - hooked up to Promise's reject method.
         */
        /**
         * Map stores command requests sent over P2P signaling in order to resolve original promises when ack is
         * received.
         * @type {Map<number, PromiseLike>}
         * @private
         */
        this._p2pSignalingRequests = new Map();
    }

    /**
     * A convenience selector to find the first {@link PeerConnection}.
     *
     * @returns {?PeerConnection}
     */
    _getFirstPeerConnection() {
        return this._peerConnections.values().next().value;
    }

    /**
     * Checks if the connection is ready to send commands.
     *
     * @returns {boolean}
     */
    isReady() {
        const first = this._getFirstPeerConnection();

        return first && first.isDataChannelActive();
    }

    /**
     * Client processing for data channel messages. A client processes only acks.
     *
     * @param {string} remoteAddress - The remote address that sent the message.
     * @param {Object} msg - JSON object received in message content.
     * @private
     * @returns {void}
     */
    _processDataChannelMessage(remoteAddress, msg) {
        const { command, requestId } = msg;

        if (command === 'ack' && requestId) {
            const commandPromise = this._p2pSignalingRequests.get(requestId);

            if (commandPromise) {
                commandPromise.resolve();
            } else {
                logger.warn('No P2P command promise exists', { requestId });
            }

            this._p2pSignalingRequests.delete(requestId);
        } else if (msg.command === 'status' && msg.newStatus) {
            this.emit(P2PSignalingClient.SPOT_TV_STATUS_UPDATE, remoteAddress, msg.newStatus);
        } else {
            super._processDataChannelMessage(remoteAddress, msg);
        }
    }

    /**
     * Callback triggered by {@link PeerConnection} whenever data channel's readiness state changes.
     *
     * @param {string} remoteAddress - The remote address associated with source {@link PeerConnection}.
     * @param {boolean} isReady - Is it ready or not.
     * @protected
     * @returns {void}
     */
    _onDCReadyStateChanged(remoteAddress, isReady) {
        super._onDCReadyStateChanged(remoteAddress, isReady);

        if (!this.isReady()) {

            // NOTE: It might be possible to give it some time to reconnect
            const count = this._p2pSignalingRequests.size;

            count && logger.log('Rejecting signaling promises', { count });

            for (const promise of this._p2pSignalingRequests.values()) {
                promise.reject('P2P signaling channel closed');
            }

            this._p2pSignalingRequests.clear();
        }
    }

    /**
     * Sends remote control command over the underlying P2P data channel.
     *
     * @param {string} command - An RCS command to be sent.
     * @param {string} data - Any data command specific.
     * @returns {Promise<void>} - Resolved when an ack is received from the server or rejected if anything goes wrong.
     */
    sendCommand(command, data) {
        logger.log('Sending command over P2P', {
            command,
            data
        });

        const peerConnection = this._getFirstPeerConnection();

        if (!peerConnection) {
            throw new Error('No PeerConnection');
        }

        const requestId = `${generate8Characters()}-${generate8Characters}`;

        // FIXME is there any better way to do this?
        // The 'reject' and 'resolve' methods are set when the promise is created.
        const promiseLikeObj = {
            _peerConnection: peerConnection
        };

        const promise = new Promise(function (resolve, reject) {
            this._peerConnection.sendDataChannelMessage(JSON.stringify({
                requestId,
                command,
                data
            }));

            this.resolve = resolve;
            this.reject = reject;
        }.bind(promiseLikeObj));

        this._p2pSignalingRequests.set(requestId, promiseLikeObj);

        return promise;
    }
}
