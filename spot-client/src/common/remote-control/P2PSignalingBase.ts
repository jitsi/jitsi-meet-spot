import { Emitter } from 'common/emitter';
import { logger } from 'common/logger';
import { PeerConnection } from 'common/webrtc';


/**
 * @typedef {Object} P2PSignalingCallbacks
 * @property onSendP2PMessage - Callback called when a message needs to be transferred over to the remote P2P
 * signaling instance during p2p connection establishment process(offer, answer and ICE candidates).
 */
export interface P2PSignalingCallbacks {
    onSendP2PMessage: (remoteAddress: string, message: any) => void;
}

/**
 * @typedef {Object} P2PSignalingOptions
 * @property getIceServers - A function which returns an array of TURN/STUN servers. See
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/RTCIceServer/urls} for more details about the format.
 */
export interface P2PSignalingOptions {
    getIceServers: () => any[];
}

/**
 * A peer to peer(direct) signaling channel used to send/receive remote control commands.
 */
export default class P2PSignalingBase extends Emitter {
    /**
     * Event emitted when readiness status of the peer connection's data channel changes. The first argument is remote
     * address and the second one is a boolean flag for ready/not ready.
     */
    static DATA_CHANNEL_READY_UPDATE = 'DATA_CHANNEL_READY_UPDATE';

    _callbacks: P2PSignalingCallbacks;
    _options: P2PSignalingOptions;

    /**
     * Stores active {@link PeerConnection}s mapped by remote address string.
     *
     * @protected
     */
    protected _peerConnections: Map<string, any>;

    /**
     * Creates new instance.
     *
     * @param callbacks - The callbacks structure, see type description for more info.
     * @param options - Extra options, see type description for more info.
     */
    constructor(callbacks: P2PSignalingCallbacks, options: P2PSignalingOptions) {
        super();
        this._callbacks = callbacks;
        this._options = options;

        this._peerConnections = new Map();
    }

    /**
     * Closes {@code PeerConnection}.
     *
     * @param remoteAddress - The remote address for which the connection will be closed.
     * @returns - Returns {@code true} if there was connection for the given address.
     */
    closeConnection(remoteAddress: string): boolean {
        const connection = this.getConnectionForAddress(remoteAddress);

        if (connection) {
            connection.stop();
            this._peerConnections.delete(remoteAddress);

            return true;
        }

        return false;
    }

    /**
     * Find connection for remote address.
     *
     * @param remoteAddress - The remote address string.
     */
    getConnectionForAddress(remoteAddress: string): any {
        return this._peerConnections.get(remoteAddress);
    }

    /**
     * Finds if any connections are currently alive.
     */
    hasActiveConnection(): boolean {
        return Boolean(
            Array.from(this._peerConnections.values()).find(
                peerConnection => peerConnection.isDataChannelActive())
        );
    }

    /**
     * Creates and initializes new {@link PeerConnection} instance for given remote address.
     *
     * @param remoteAddress - The remote address string.
     * @private
     * @throws An error if {@link PeerConnection} already exists for the given address.
     */
    _initPeerConnection(remoteAddress: string): any {
        if (this._peerConnections.get(remoteAddress)) {
            throw new Error(`P2P signaling connection already exists for: ${remoteAddress}`);
        }

        const iceServers = this._options.getIceServers();
        const peerConnection = new PeerConnection(remoteAddress, iceServers);

        if (!iceServers || !iceServers.length) {
            logger.warn('Initialized P2P without ICE servers');
        }

        this._peerConnections.set(remoteAddress, peerConnection);

        peerConnection.addListener(
            PeerConnection.DATA_CHANNEL_STATUS_CHANGED, (pc: any, isReady: boolean) => {
                this._onDCReadyStateChanged(pc.remoteAddress, isReady);
            });
        peerConnection.addListener(
            PeerConnection.DATA_CHANNEL_MSG_RECEIVED, (pc: any, data: string) => {
                this._onDataChannelMessage(pc.remoteAddress, data);
            });
        peerConnection.addListener(
            PeerConnection.ON_ICE_CANDIDATE, (pc: any, candidate: any) => {
                // No 'candidate' means end of candidates
                if (candidate) {
                    this._callbacks.onSendP2PMessage(
                        pc.remoteAddress, { candidate: JSON.stringify(candidate) });
                }
            });

        return peerConnection;
    }

    /**
     * Callback fired when a message has been received over {@link PeerConnection}'s data channel.
     *
     * @param remoteAddress - The remote address that sent the message.
     * @param rawData - Raw message data as text.
     * @private
     */
    _onDataChannelMessage(remoteAddress: string, rawData: string): void {
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

        this._processDataChannelMessage(remoteAddress, msg);
    }

    /**
     * Method to be overridden by subclasses in order to process client/server specific messages received over P2P data
     * channel. Should still call super for common processing.
     *
     * @param remoteAddress - The remote address that sent the message.
     * @param msg - JSON object received in message content.
     * @protected
     */
    _processDataChannelMessage(remoteAddress: string, msg: any): void {
        logger.warn('_processDataChannelMessage ignoring a msg', {
            msg,
            remoteAddress
        });
    }

    /**
     * Callback triggered by {@link PeerConnection} whenever data channel's readiness state changes.
     *
     * @param remoteAddress - The remote address associated with source {@link PeerConnection}.
     * @param isReady - Is it ready or not.
     * @protected
     */
    _onDCReadyStateChanged(remoteAddress: string, isReady: boolean): void {
        logger.log(`P2P data channel ${isReady ? 'ready' : 'not-ready'}`, {
            isReady,
            remoteAddress
        });
        this.emit(P2PSignalingBase.DATA_CHANNEL_READY_UPDATE, remoteAddress, isReady);
    }

    /**
     * Tries to parse given JSON string and convert it into an {@code Object}. If fails logs an error and returns
     * {@code undefined}.
     *
     * @param jsonText - The text to be parsed.
     * @param errorMessage - A text to be added at the end of the error message to be logged on an error.
     * @private
     */
    _parseJSONorLogError(jsonText: string, errorMessage: string): any {
        try {
            return JSON.parse(jsonText);
        } catch (error) {
            logger.error(`Failed to parse ${errorMessage}`, {
                error,
                text: jsonText
            });

            return undefined;
        }
    }

    /**
     * Processing for an answer type of message.
     *
     * @param peerConnection - The {@link PeerConnection} associated with remote address from which
     * the messages has been received.
     * @param data - A message data with an answer.
     * @private
     */
    _processAnswer(peerConnection: any, data: any): void {
        const answer = this._parseJSONorLogError(data.answer, 'answer message');

        if (!answer) {
            return;
        }

        peerConnection.setAnswer(answer)
            .catch((error: any) => {
                logger.error('Failed to set an answer', {
                    data,
                    error,
                    remoteAddress: peerConnection.remoteAddress
                });
            });
    }

    /**
     * Processing for ICE candidate message.
     *
     * @param peerConnection - The {@link PeerConnection} associated with remote address from which
     * the messages has been received.
     * @param data - A message data with an ICE candidate.
     * @private
     */
    _processIceCandidate(peerConnection: any, data: any): void {
        const candidate = this._parseJSONorLogError(data.candidate, 'ICE candidate');

        if (!candidate) {
            return;
        }

        peerConnection.addRemoteIceCandidate(candidate).catch((error: any) => {
            logger.error('Failed to set remote candidate', {
                data,
                error,
                remoteAddress: peerConnection.remoteAddress
            });
        });
    }

    /**
     * This method is to be called whenever P2P channel message arrives from the remote side. Those messages are
     * emitted by the {@link P2PSignalingCallbacks.onSendP2PMessage} callback on the remote side and are to be set over
     * the main signaling channel and set here.
     *
     * @param data - Message data.
     * @param from - Remote address used to match connections.
     */
    processP2PMessage({ data, from }: { data: any; from: string; }): void {
        logger.log('processMessage', {
            data,
            from
        });

        if (data.offer) {
            this._processOffer(from, data);

            return;
        }

        const peerConnection = this.getConnectionForAddress(from);

        if (!peerConnection) {
            logger.error('processMessage - no PeerConnection', {
                data,
                from
            });

            return;
        }

        if (peerConnection.remoteAddress !== from) {
            logger.error('Received message from different remote address', {
                data,
                from,
                remoteAddress: peerConnection.remoteAddress
            });

            return;
        }

        if (data.answer) {
            this._processAnswer(peerConnection, data);

            return;
        }

        if (data.candidate) {
            this._processIceCandidate(peerConnection, data);

            return;
        }

        logger.warn('Skipped message processing', {
            from,
            data
        });
    }

    /**
     * Processing for offer message.
     *
     * @param from - Remote address string.
     * @param data - Message data with an offer.
     * @private
     */
    _processOffer(from: string, data: any): void {
        const offer = this._parseJSONorLogError(data.offer, 'offer message');

        if (!offer) {
            return;
        }

        const connection = this.getConnectionForAddress(from);

        if (connection && connection.isDataChannelActive()) {
            logger.error('Received offer, but PeerConnection is still there', {
                data,
                from
            });

            return;
        } else if (connection) {
            this.closeConnection(from);
        }

        // Try catch block in case something's wrong with WebRTC version or not supported
        try {
            const peerConnection = this._initPeerConnection(from);

            peerConnection.setOffer(offer)
                .then((answer: any) => {
                    this._callbacks.onSendP2PMessage(
                        from, {
                            answer: JSON.stringify(answer)
                        });
                }, (error: any) => {
                    logger.error('Failed to setOffer', {
                        data,
                        error,
                        from
                    });
                });
        } catch (error) {
            logger.error('process offer - failed', { error });
        }
    }

    /**
     * Starts the process of establishing new P2P signaling channel with given remote address.
     *
     * @param remoteAddress - The remote address string.
     */
    start(remoteAddress: string): void {
        // Try catch block in case something's wrong with WebRTC version or not supported
        try {
            const peerConnection = this._initPeerConnection(remoteAddress);

            peerConnection.createOffer().then((offerDescription: any) => {
                this._callbacks.onSendP2PMessage(remoteAddress, { offer: JSON.stringify(offerDescription) });
            }, (error: any) => {
                logger.error('Failed to create P2P offer', { error });
            });
        } catch (error) {
            logger.error('Failed to initialize PeerConnection', { error });
        }
    }

    /**
     * Stops all P2P channels.
     */
    stop(): void {
        for (const pc of this._peerConnections.values()) {
            pc.stop();
        }

        this._peerConnections.clear();
    }
}
