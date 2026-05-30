import { Emitter } from 'common/emitter';
import { logger } from 'common/logger';


export const DEFAULT_STUN_SERVERS: RTCIceServer[] = [
    { urls: 'stun:meet-jit-si-turnrelay.jitsi.net:443' }
];

/**
 * A wrapper around {@code RTCPeerConnection}. Currently only deals with a single data channel and does not handle
 * any media streams.
 */
export default class PeerConnection extends Emitter {
    /**
     * Event sent when a new message is received over the data channel.
     */
    static DATA_CHANNEL_MSG_RECEIVED = 'PC_DATA_CHANNEL_MSG_RECEIVED';

    /**
     * The {@code PeerConnection} class tries to manage a single data channel and this event is emitted whenever this
     * data channel's status changes.
     */
    static DATA_CHANNEL_STATUS_CHANGED = 'PC_DATA_CHANNEL_STATUS_CHANGED';

    /**
     * Event emitted when new ICE candidate has been discovered. It needs to be transferred over and set on the remote
     * {@code PeerConnection}. See {@link PeerConnection.addRemoteIceCandidate}.
     */
    static ON_ICE_CANDIDATE = 'PC_ON_ICE_CANDIDATE';

    remoteAddress: string;
    _iceServers: RTCIceServer[];
    _peerConnection: RTCPeerConnection | null;
    _dataChannel: RTCDataChannel | null;
    _isDataChannelActive: boolean;

    /**
     * Creates new instance of {@link PeerConnection}.
     *
     * @param remoteAddress - A string which identifies the remote peer.
     * @param iceServers - An array with ICE STUN/TURN servers description as defined by WebRTC. See
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/RTCIceServer/urls} for more details about the format.
     */
    constructor(remoteAddress: string, iceServers?: RTCIceServer[]) {
        super();
        this.remoteAddress = remoteAddress;
        this._iceServers = iceServers || DEFAULT_STUN_SERVERS;
        this._peerConnection = null;
        this._dataChannel = null;
        this._isDataChannelActive = false;
    }

    /**
     * Call this method to add remote ICE candidate to this connection.
     *
     * @param candidate - Remote ICE candidate to be added to this connection.
     * @returns {Promise<void>}
     */
    addRemoteIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
        if (!this._peerConnection) {
            return Promise.reject('addRemoteIceCandidate - no _peerConnection');
        }

        return this._peerConnection.addIceCandidate(candidate);
    }

    /**
     * Creates an offer and returns a structure that needs to be transferred over to the remote peer and set using
     * {@link setOffer}.
     *
     * @returns {Promise<RTCSessionDescriptionInit>}
     */
    createOffer(): Promise<RTCSessionDescriptionInit> {
        this._initPeerConnection();

        const peerConnection = this._peerConnection as RTCPeerConnection;
        const dataChannel = peerConnection.createDataChannel('proxyConnectionDC');

        this._initDataChannel(dataChannel);

        return peerConnection.createOffer()
            .then(offer => peerConnection.setLocalDescription(offer)
                .then(() => offer)
            );
    }

    /**
     * Re-evaluates the current status of the data channel and emits the update event if necessary.
     *
     * @private
     * @returns {void}
     */
    _emitDataChannelStatusUpdate(): void {
        const oldStatus = this._isDataChannelActive;

        this._isDataChannelActive = this.isDataChannelActive();

        if (oldStatus !== this._isDataChannelActive) {
            this.emit(
                PeerConnection.DATA_CHANNEL_STATUS_CHANGED, this, this._isDataChannelActive);
        }
    }

    /**
     * Used to internally initialize new data channel and bind required listeners.
     *
     * @param dataChannel - The data channel instance to be initialized.
     * @private
     * @returns {void}
     */
    _initDataChannel(dataChannel: RTCDataChannel): void {
        if (this._dataChannel) {
            logger.error('this._dataChannel already exists', { dataChannel });

            return;
        }

        this._dataChannel = dataChannel;
        dataChannel.onmessage = event => {
            this.emit(PeerConnection.DATA_CHANNEL_MSG_RECEIVED, this, event.data);
        };
        dataChannel.onopen = this._emitDataChannelStatusUpdate.bind(this);
        dataChannel.onclose = this._emitDataChannelStatusUpdate.bind(this);
    }

    /**
     * Initializes new {@code RTCPeerConnection} instance.
     *
     * @private
     * @returns {void}
     */
    _initPeerConnection(): void {
        if (this._peerConnection) {
            throw new Error('_peerConnection already exists');
        }

        // Convert deprecated 'url' to 'urls' if applicable
        for (const server of this._iceServers as Array<RTCIceServer & { url?: string; }>) {
            if (!server.urls && server.url) {
                server.urls = server.url;
                delete server.url;
            }
        }

        const peerConnection = this._peerConnection = new RTCPeerConnection({
            iceServers: this._iceServers
        });

        peerConnection.onicecandidate = event => {
            this.emit(PeerConnection.ON_ICE_CANDIDATE, this, event.candidate);
        };
        peerConnection.onsignalingstatechange = () => {
            logger.log('PeerConnection signaling state changed', {
                remoteAddress: this.remoteAddress,
                signalingState: peerConnection.signalingState
            });
        };
        peerConnection.oniceconnectionstatechange = () => {
            logger.log('PeerConnection ICE state changed', {
                iceState: peerConnection.iceConnectionState,
                remoteAddress: this.remoteAddress
            });
            this._emitDataChannelStatusUpdate();
        };
        peerConnection.ondatachannel = event => {
            logger.log('PeerConnection new data channel', {
                remoteAddress: this.remoteAddress
            });
            this._initDataChannel(event.channel);
        };
    }

    /**
     * Checks if the data channel is currently active.
     *
     * @returns {boolean}
     */
    isDataChannelActive(): boolean {
        return Boolean(this._peerConnection
            && (this._peerConnection.iceConnectionState === 'connected'
                || this._peerConnection.iceConnectionState === 'completed')
            && this._dataChannel && this._dataChannel.readyState === 'open');
    }

    /**
     * Sends a message over the data channel. Can be used only if the data channel is currently active.
     *
     * @param message - A string to send.
     * @returns {boolean}
     */
    sendDataChannelMessage(message: string): boolean {
        if (!this.isDataChannelActive() || !this._dataChannel) {
            return false;
        }

        try {
            this._dataChannel.send(message);

            return true;
        } catch (error) {
            logger.error('sendDataChannelMessage failed', { error });

            return false;
        }
    }

    /**
     * Sets an answer created by remote peer in response to the offer generated by this instance.
     *
     * @param answer - The answer to set.
     * @returns {Promise<void>}
     */
    setAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
        if (!this._peerConnection) {
            return Promise.reject('setAnswer - no _peerConnection');
        }

        return this._peerConnection.setRemoteDescription(answer);
    }

    /**
     * Sets remote offer created by the remote peer.
     *
     * @param offer - The remote offer to be set.
     * @returns {Promise<RTCSessionDescriptionInit>} - A promise resolved with an answer that needs to be transferred
     * over to the remote peer and set using {@link setAnswer}.
     */
    setOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
        this._initPeerConnection();

        const peerConnection = this._peerConnection as RTCPeerConnection;

        return peerConnection.setRemoteDescription(offer)
            .then(() => peerConnection.createAnswer())
            .then(answer => peerConnection.setLocalDescription(answer)
                                                .then(() => answer)
            );
    }

    /**
     * Stops this instance.
     *
     * @returns {void}
     */
    stop(): void {
        if (this._dataChannel) {
            this._dataChannel.close();
            this._dataChannel = null;
        }
        if (this._peerConnection) {
            this._peerConnection.close();
            this._peerConnection = null;
        }
    }
}
