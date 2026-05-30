import { logger } from 'common/logger';

import P2PSignalingBase from './P2PSignalingBase';

interface PromiseLike {
    /**
     * Hooked up to Promise's reject method.
     */
    reject: (reason?: any) => void;

    /**
     * Hooked up to Promise's resolve method.
     */
    resolve: (value?: any) => void;
}

/**
 * A P2P signaling client which exposes method for sending remote control commands and is to be used by a Spot Remote.
 */
export default class P2PSignalingClient extends P2PSignalingBase {
    /**
     * Events fired when Spot TV status update is received over the P2P data channel. As an argument it will pass
     * Spot TV's remote address and the entire TV state object.
     */
    static SPOT_TV_STATUS_UPDATE = 'SPOT_TV_STATUS_UPDATE';

    _p2pSignalingRequests: Map<string, PromiseLike>;

    /**
     * Creates new instance.
     *
     * @param callbacks - See type description for more info.
     * @param options - See type description for more info.
     */
    constructor(callbacks: any, options: any) {
        super(callbacks, options);

        /**
         * Map stores command requests sent over P2P signaling in order to resolve original promises when ack is
         * received.
         *
         * @private
         */
        this._p2pSignalingRequests = new Map();
    }

    /**
     * A convenience selector to find the first {@link PeerConnection}.
     *
     * @returns
     */
    _getFirstPeerConnection(): any {
        return this._peerConnections.values().next().value;
    }

    /**
     * Checks if the connection is ready to send commands.
     *
     * @returns
     */
    isReady(): boolean {
        const first = this._getFirstPeerConnection();

        return first && first.isDataChannelActive();
    }

    /**
     * Client processing for data channel messages. A client processes only acks.
     *
     * @param remoteAddress - The remote address that sent the message.
     * @param msg - JSON object received in message content.
     * @private
     * @returns
     */
    _processDataChannelMessage(remoteAddress: string, msg: any): void {
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
     * @param remoteAddress - The remote address associated with source {@link PeerConnection}.
     * @param isReady - Is it ready or not.
     * @protected
     * @returns
     */
    _onDCReadyStateChanged(remoteAddress: string, isReady: boolean): void {
        super._onDCReadyStateChanged(remoteAddress, isReady);

        if (!this.isReady()) {

            // NOTE: It might be possible to give it some time to reconnect
            const count = this._p2pSignalingRequests.size;

            if (count) {
                logger.log('Rejecting signaling promises', { count });
            }

            for (const promise of this._p2pSignalingRequests.values()) {
                promise.reject('P2P signaling channel closed');
            }

            this._p2pSignalingRequests.clear();
        }
    }

    /**
     * Sends remote control command over the underlying P2P data channel.
     *
     * @param command - An RCS command to be sent.
     * @param data - Any data command specific.
     * @returns - Resolved when an ack is received from the server or rejected if anything goes wrong.
     */
    sendCommand(command: string, data: string): Promise<void> {
        logger.log('Sending command over P2P', {
            command,
            data
        });

        const peerConnection = this._getFirstPeerConnection();

        if (!peerConnection) {
            throw new Error('No PeerConnection');
        }

        const requestId = window.crypto.randomUUID();

        // FIXME is there any better way to do this?
        // The 'reject' and 'resolve' methods are set when the promise is created.
        const promiseLikeObj: any = {
            _peerConnection: peerConnection
        };

        const promise = new Promise<void>(function(this: any, resolve: (value?: void) => void, reject: (reason?: any) => void) {
            if (!this._peerConnection.sendDataChannelMessage(JSON.stringify({
                requestId,
                command,
                data
            }))) {
                this._p2pSignalingRequests.delete(requestId);
                reject('Failed to send command over P2P');
            }

            this.resolve = resolve;
            this.reject = reject;
        }.bind(promiseLikeObj));

        this._p2pSignalingRequests.set(requestId, promiseLikeObj);

        return promise;
    }
}
