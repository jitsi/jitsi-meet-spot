import { Emitter } from 'common/emitter';
import { logger } from 'common/logger';
import { PeerConnection } from 'common/webrtc';


/**
 * @typedef {Object} P2PSignalingCallbacks
 * @property {function} onSendP2PMessage - Callback called when a message needs to be transferred over to the remote P2P
 * signaling instance during p2p connection establishment process(offer, answer and ICE candidates).
 */
/**
 * @typedef {Object} P2PSignalingOptions
 * @property {RTCIceServer[]} iceServers - An array of TURN/STUN servers. See
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/RTCIceServer/urls} for more details about the format.
 */
/**
 * A peer to peer(direct) signaling channel used to send/receive remote control commands.
 */
export default class P2PSignalingBase extends Emitter {
    /**
     * Event emitted when readiness status of the peer connection's data channel changes. The first argument is remote
     * address and the second one is a boolean flag for ready/not ready.
     *
     * @type {string}
     */
    static DATA_CHANNEL_READY_UPDATE = 'DATA_CHANNEL_READY_UPDATE';

    /**
     * Creates new instance.
     *
     * @param {P2PSignalingCallbacks} callbacks - The callbacks structure, see type description for more info.
     * @param {P2PSignalingOptions} options - Extra options, see type description for more info.
     */
    constructor(callbacks, options) {
        super();
        this._callbacks = callbacks;
        this._options = options;

        /**
         * Stores active {@link PeerConnection}s mapped by remote address string.
         *
         * @type {Map<string, PeerConnection>}
         * @protected
         */
        this._peerConnections = new Map();
    }

    /**
     * Find connection for remote address.
     *
     * @param {string} remoteAddress - The remote address string.
     * @returns {?PeerConnection}
     */
    getConnectionForAddress(remoteAddress) {
        return this._peerConnections.get(remoteAddress);
    }

    /**
     * Finds if any connections are currently alive.
     *
     * @returns {boolean}
     */
    hasActiveConnection() {
        for (const peerConnection of this._peerConnections.values()) {
            if (peerConnection.isDataChannelActive()) {
                return true;
            }
        }

        return false;
    }

    /**
     * Creates and initializes new {@link PeerConnection} instance for given remote address.
     *
     * @param {string} remoteAddress - The remote address string.
     * @private
     * @returns {PeerConnection}
     * @throws An error if {@link PeerConnection} already exists for the given address.
     */
    _initPeerConnection(remoteAddress) {
        if (this._peerConnections.get(remoteAddress)) {
            throw new Error(`P2P signaling connection already exists for: ${remoteAddress}`);
        }

        const peerConnection = new PeerConnection(remoteAddress, this._options.iceServers);

        this._peerConnections.set(remoteAddress, peerConnection);

        peerConnection.addListener(
            PeerConnection.DATA_CHANNEL_STATUS_CHANGED, (pc, isReady) => {
                this._onDCReadyStateChanged(pc.remoteAddress, isReady);
            });
        peerConnection.addListener(
            PeerConnection.DATA_CHANNEL_MSG_RECEIVED, (pc, data) => {
                this._onDataChannelMessage(pc.remoteAddress, data);
            });
        peerConnection.addListener(
            PeerConnection.ON_ICE_CANDIDATE, (pc, candidate) => {
                // No 'candidate' means end of candidates
                candidate && this._callbacks.onSendP2PMessage(
                        pc.remoteAddress, { candidate: JSON.stringify(candidate) });
            });

        return peerConnection;
    }

    /**
     * Callback fired when a message has been received over {@link PeerConnection}'s data channel.
     *
     * @param {string} remoteAddress - The remote address that sent the message.
     * @param {string} rawData - Raw message data as text.
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

        this._processDataChannelMessage(remoteAddress, msg);
    }

    /**
     * Method to be overridden by subclasses in order to process client/server specific messages received over P2P data
     * channel. Should still call super for common processing.
     *
     * @param {string} remoteAddress - The remote address that sent the message.
     * @param {Object} msg - JSON object received in message content.
     * @protected
     * @returns {void}
     */
    _processDataChannelMessage(remoteAddress, msg) {
        logger.warn('_processDataChannelMessage ignoring a msg', {
            msg,
            remoteAddress
        });
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
     * @param {string} jsonText - The text to be parsed.
     * @param {string} errorMessage - A text to be added at the end of the error message to be logged on an error.
     * @returns {undefined|Object}
     * @private
     */
    _parseJSONorLogError(jsonText, errorMessage) {
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
     * @param {PeerConnection} peerConnection - The {@link PeerConnection} associated with remote address from which
     * the messages has been received.
     * @param {Object} data - A message data with an answer.
     * @private
     * @returns { void}
     */
    _processAnswer(peerConnection, data) {
        const answer = this._parseJSONorLogError(data.answer, 'answer message');

        if (!answer) {
            return;
        }

        peerConnection.setAnswer(answer)
            .catch(error => {
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
     * @param {PeerConnection} peerConnection - The {@link PeerConnection} associated with remote address from which
     * the messages has been received.
     * @param {Object} data - A message data with an ICE candidate.
     * @private
     * @returns {void}
     */
    _processIceCandidate(peerConnection, data) {
        const candidate = this._parseJSONorLogError(data.candidate, 'ICE candidate');

        if (!candidate) {
            return;
        }

        peerConnection.addRemoteIceCandidate(candidate).catch(error => {
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
     * @param {Object} data - Message data.
     * @param {string} from - Remote address used to match connections.
     * @returns {void}
     */
    processP2PMessage({ data, from }) {
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
     * @param {string} from - Remote address string.
     * @param {string} data - Message data with an offer.
     * @private
     * @returns {void}
     */
    _processOffer(from, data) {
        if (this.getConnectionForAddress(from)) {
            logger.error('Received offer, but PeerConnection is still there', {
                data,
                from
            });

            return;
        }

        const offer = this._parseJSONorLogError(data.offer, 'offer message');

        if (!offer) {
            return;
        }

        // Try catch block in case something's wrong with WebRTC version or not supported
        try {
            const peerConnection = this._initPeerConnection(from);

            peerConnection.setOffer(offer)
                .then(answer => {
                    this._callbacks.onSendP2PMessage(
                        from, {
                            answer: JSON.stringify(answer)
                        });
                }, error => {
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
     * @param {string} remoteAddress - The remote address string.
     * @returns {void}
     */
    start(remoteAddress) {
        // Try catch block in case something's wrong with WebRTC version or not supported
        try {
            const peerConnection = this._initPeerConnection(remoteAddress);

            peerConnection.createOffer().then(offerDescription => {
                this._callbacks.onSendP2PMessage(remoteAddress, { offer: JSON.stringify(offerDescription) });
            }, error => {
                logger.error('Failed to create P2P offer', { error });
            });
        } catch (error) {
            logger.error('Failed to initialize PeerConnection', { error });
        }
    }

    /**
     * Stops all P2P channels.
     *
     * @returns {void}
     */
    stop() {
        for (const pc of this._peerConnections.values()) {
            pc.stop();
        }

        this._peerConnections.clear();
    }
}
