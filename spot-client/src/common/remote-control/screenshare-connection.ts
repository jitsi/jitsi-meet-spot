import { logger } from 'common/logger';
import { JitsiMeetJSProvider } from 'common/vendor';

/**
 * The default screensharing frame rate, matching lib-jitsi-meet's
 * {@code SS_DEFAULT_FRAME_RATE}. Used as the floor that keeps Chromium from
 * dropping a static screenshare to "0Hz mode", and as the threshold above which
 * the desktop track is hinted as motion rather than detail.
 *
 * @type {number}
 */
const SS_DEFAULT_FRAME_RATE = 5;

interface ScreenshareConnectionOptions {
    getIceServers?: () => RTCIceServer[] | undefined;
    mediaConfiguration: any;
    onConnectionClosed: () => void;
    sendMessage: (to: string, data: any) => void;
}

/**
 * A direct-cast screenshare signal exchanged with the Jitsi-Meet meeting. The
 * shape matches Jitsi-Meet's external share receiver (the successor to the
 * Chromium-only {@code ProxyConnectionService}), reached through the Spot-TV
 * which relays these signals into the iframe API.
 */
interface ScreenshareSignal {
    candidate?: RTCIceCandidateInit;
    kind: 'answer' | 'candidate' | 'offer' | 'stop';
    sdp?: RTCSessionDescriptionInit;
}

/**
 * Streams a Spot-Remote's captured desktop, and its optional system audio,
 * directly into a Jitsi-Meet meeting over a plain {@code RTCPeerConnection}.
 *
 * The Spot-Remote is the offerer. The Jitsi-Meet meeting participant is the
 * answerer; it is reached indirectly through the Spot-TV, which relays the
 * offer/answer/candidate/stop signals into the Jitsi-Meet iframe API via
 * {@code sendExternalShareSignal} and back out via the {@code externalShareSignal}
 * event.
 */
export default class ScreenshareConnection {
    options: ScreenshareConnectionOptions;
    _isActive: boolean;
    _onTrackEnded: () => void;
    _peerConnection: RTCPeerConnection | null;
    _signalQueue: Promise<void>;
    _spotJid: string | null;
    _stream: MediaStream | null;

    /**
     * Initializes a new {@code ScreenshareConnection} instance.
     *
     * @param options - Configuration to initialize with.
     * @param options.getIceServers - Returns the ICE/TURN servers used to
     * establish the peer connection with the Jitsi-Meet meeting. Called lazily
     * when the peer connection is created so the freshest configuration is used.
     * @param options.mediaConfiguration - Describes how the desktop sharing
     * source should be captured.
     * @param options.mediaConfiguration.desktopSharingFrameRate - The frames
     * per second which should be captured from the desktop sharing source. Can
     * include a "max" and "min" key, both being numbers.
     * @param options.sendMessage - Callback invoked when a screenshare signal
     * needs to be sent out to the Spot-TV.
     * @param options.onConnectionClosed - Callback to invoke when the
     * connection, or part of the connection, has closed itself.
     */
    constructor(options: ScreenshareConnectionOptions) {
        this.options = options;

        /**
         * Whether or not this connection is meant to be active. Used to prevent
         * connection events from firing after the connection has been stopped.
         *
         * @type {boolean}
         */
        this._isActive = false;

        /**
         * Reference to the listener attached to the captured desktop track, kept
         * so it can be detached on stop. Replaced once a stream is captured.
         *
         * @type {Function}
         */
        this._onTrackEnded = () => { /* Replaced once a stream is captured. */ };

        /**
         * The {@code RTCPeerConnection} used to send the captured desktop into
         * the Jitsi-Meet meeting.
         *
         * @type {RTCPeerConnection|null}
         */
        this._peerConnection = null;

        /**
         * Serializes processing of incoming signals so that, for example, an ICE
         * candidate is never applied before the remote answer has been set.
         *
         * @type {Promise}
         */
        this._signalQueue = Promise.resolve();

        /**
         * The jid of the Spot-TV which relays signals to and from the Jitsi-Meet
         * meeting.
         *
         * @type {string|null}
         */
        this._spotJid = null;

        /**
         * The captured desktop {@code MediaStream}, held so it can be cleaned up
         * when the connection is closed.
         *
         * @type {MediaStream|null}
         */
        this._stream = null;
    }

    /**
     * Forwards a screenshare signal received from the Jitsi-Meet meeting for
     * processing.
     *
     * @param message - A message wrapping the screenshare signal.
     * @param message.data - The {@code ScreenshareSignal} to process.
     * @returns {void}
     */
    processMessage(message: any): void {
        logger.log('screenshare connection got message', { message });

        this._signalQueue
            = this._signalQueue.then(() => this._processSignal(message?.data));
    }

    /**
     * See the description of {@link _createTracks}.
     *
     * @public
     * @returns - See the return description of {@link _createTracks}.
     */
    createTracks(): Promise<void> {
        return this._createTracks(/* deferred start */ true);
    }

    /**
     * Asks the user to select the desktop to be used for screensharing and
     * captures it. The stream is stored on this connection instance and will be
     * used when {@link startScreenshare} is called.
     *
     * @param deferredStart - Whether or not this call is made in the deferred
     * start scenario where the stream is captured before the connection gets
     * established.
     * @private
     * @returns - Resolved when the user selects the desktop and the stream is
     * captured successfully. The promise is rejected if the user cancels the
     * desktop picker or capture otherwise fails.
     */
    _createTracks(deferredStart: boolean): Promise<void> {
        if (this._stream) {
            return Promise.resolve();
        }

        return navigator.mediaDevices.getDisplayMedia(
            this._getDisplayMediaConstraints()
        ).then((stream: MediaStream) => {
            logger.log('screenshareConnection captured desktop stream', {
                hasAudio: stream.getAudioTracks().length > 0
            });

            this._stream = stream;

            /**
             * Clean up the stream in case the connection was stopped while the
             * user was still selecting a screenshare source.
             */
            if (!this._isActive && !deferredStart) {
                logger.log('screenshareConnection got stream in inactive state');

                this.stop();

                return;
            }

            /**
             * The 'ended' event fires when the user stops the share from the
             * browser's own UI. It does not fire for a programmatic
             * {@code track.stop()}, so an explicit {@link stop} will not be
             * mistaken for the connection being lost.
             */
            const [ videoTrack ] = stream.getVideoTracks();

            this._applyDesktopTrackConstraints(videoTrack);

            this._onTrackEnded = () => {
                logger.log('screenshareConnection desktop stopped');

                if (this._isActive || deferredStart) {
                    this.options.onConnectionClosed();
                }
            };

            videoTrack?.addEventListener('ended', this._onTrackEnded);
        });
    }

    /**
     * Begins the process of establishing a direct connection with a participant
     * in a Jitsi-Meet meeting.
     *
     * @param spotJid - The jid of the Spot-TV which should relay signaling
     * messages to and from the Jitsi-Meet meeting.
     * @returns {Promise}
     */
    startScreenshare(spotJid: string): Promise<void> {
        logger.log('screenshare connection started', { spotJid });

        this._isActive = true;
        this._spotJid = spotJid;

        const preStart = this._stream
            ? Promise.resolve()
            : this._createTracks(/* deferred start */ false);

        return preStart.then(() => this._createPeerConnection());
    }

    /**
     * Cleans up the state of this {@code ScreenshareConnection} instance by
     * tearing down the peer connection and stopping all captured media.
     *
     * @returns {void}
     */
    stop(): void {
        logger.log('screenshareConnection stopping');

        const wasActive = this._isActive;

        this._isActive = false;

        if (this._peerConnection) {
            // Tell the Jitsi-Meet receiver to tear down its side.
            if (wasActive || this._spotJid) {
                this._send({ kind: 'stop' });
            }

            this._peerConnection.close();
            this._peerConnection = null;
        }

        if (this._stream) {
            const [ videoTrack ] = this._stream.getVideoTracks();

            videoTrack?.removeEventListener('ended', this._onTrackEnded);
            this._stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            this._stream = null;
        }

        this._spotJid = null;
    }

    /**
     * Creates the {@code RTCPeerConnection}, adds the captured tracks and sends
     * the offer out to the Jitsi-Meet meeting.
     *
     * @private
     * @returns {Promise}
     */
    _createPeerConnection(): Promise<void> {
        // The connection may have been stopped while the desktop was still being
        // captured, in which case there is nothing to connect.
        if (!this._isActive) {
            return Promise.resolve();
        }

        const peerConnection = new RTCPeerConnection({
            iceServers: this._getIceServers()
        });

        this._peerConnection = peerConnection;

        peerConnection.addEventListener('icecandidate', ({ candidate }) => {
            if (candidate && this._peerConnection === peerConnection) {
                this._send({
                    candidate: candidate.toJSON(),
                    kind: 'candidate'
                });
            }
        });

        peerConnection.addEventListener('connectionstatechange', () => {
            const { connectionState } = peerConnection;

            logger.log('screenshareConnection state changed', { connectionState });

            if (this._isActive
                    && this._peerConnection === peerConnection
                    && connectionState === 'failed') {
                this.options.onConnectionClosed();
            }
        });

        this._stream?.getTracks().forEach(
            (track: MediaStreamTrack) =>
                peerConnection.addTrack(track, this._stream as MediaStream));

        return peerConnection.createOffer()
            .then((offer: RTCSessionDescriptionInit) =>
                peerConnection.setLocalDescription(offer))
            .then(() => {
                const { localDescription } = peerConnection;

                // Bail if the connection was torn down while the offer was being
                // created, so no signal is sent for a dead peer connection.
                if (!localDescription || this._peerConnection !== peerConnection) {
                    return;
                }

                this._send({
                    kind: 'offer',
                    sdp: {
                        sdp: localDescription.sdp,
                        type: localDescription.type
                    }
                });
            });
    }

    /**
     * Returns the ICE/TURN servers for the peer connection, warning when none
     * are available (in which case only same-network shares will connect).
     *
     * @private
     * @returns {Array<RTCIceServer>}
     */
    _getIceServers(): RTCIceServer[] {
        const iceServers = this.options.getIceServers?.() ?? [];

        if (!iceServers.length) {
            logger.warn(
                'screenshareConnection has no ICE servers; only same-network shares will connect');
        }

        return iceServers;
    }

    /**
     * Builds the {@code getDisplayMedia} constraints, requesting system audio so
     * it can be shared alongside the desktop video.
     *
     * Unlike {@code getUserMedia}, {@code getDisplayMedia} rejects {@code min}
     * and {@code exact} constraints on a display surface (a screen cannot
     * guarantee a minimum frame rate), so Chrome and Firefox throw an
     * {@code OverconstrainedError} for the {@code { max, min }} shape the config
     * uses. Only the maximum frame rate is expressed here.
     *
     * @private
     * @returns {Object}
     */
    _getDisplayMediaConstraints() {
        const frameRate = this.options.mediaConfiguration?.desktopSharingFrameRate;
        const maxFrameRate = typeof frameRate === 'number' ? frameRate : frameRate?.max;

        return {
            audio: true,
            video: maxFrameRate ? { frameRate: { max: maxFrameRate } } : true
        };
    }

    /**
     * Tunes the captured desktop video track the way lib-jitsi-meet's screen
     * obtainer does. A minimum frame rate cannot be requested through
     * {@code getDisplayMedia} (see {@link _getDisplayMediaConstraints}), so it is
     * applied to the track afterwards: on Chromium this holds a floor on the
     * frame rate to keep the encoder out of "0Hz mode", where a static screen
     * transmits no frames and the meeting sees a frozen image. The content hint
     * tells the encoder whether to favour motion or per-frame detail.
     *
     * @param videoTrack - The captured desktop video track.
     * @private
     * @returns {void}
     */
    _applyDesktopTrackConstraints(videoTrack?: MediaStreamTrack): void {
        if (!videoTrack) {
            return;
        }

        const frameRate = this.options.mediaConfiguration?.desktopSharingFrameRate;
        const maxFrameRate = typeof frameRate === 'number' ? frameRate : frameRate?.max;

        if ('contentHint' in videoTrack) {
            videoTrack.contentHint
                = typeof maxFrameRate === 'number' && maxFrameRate > SS_DEFAULT_FRAME_RATE
                    ? 'motion'
                    : 'detail';
        }

        // A min frame-rate constraint only defeats Chromium's 0Hz mode; other
        // engines do not support it and would reject the constraint.
        if (!JitsiMeetJSProvider.get().util.browser.isChromiumBased()) {
            return;
        }

        const configuredMin = typeof frameRate === 'object' ? frameRate?.min : undefined;
        const minFrameRate = typeof configuredMin === 'number' && configuredMin > 0
            ? configuredMin
            : SS_DEFAULT_FRAME_RATE;

        videoTrack.applyConstraints({ frameRate: { min: minFrameRate } })
            .catch((error: Error) => {
                logger.warn('screenshareConnection could not apply min fps constraint', {
                    error,
                    minFrameRate
                });
            });
    }

    /**
     * Applies a single screenshare signal received from the Jitsi-Meet meeting.
     *
     * @param signal - The {@code ScreenshareSignal} to apply.
     * @private
     * @returns {Promise}
     */
    async _processSignal(signal?: ScreenshareSignal): Promise<void> {
        const peerConnection = this._peerConnection;

        if (!peerConnection || !signal) {
            return;
        }

        try {
            if (signal.kind === 'answer' && signal.sdp) {
                await peerConnection.setRemoteDescription(signal.sdp);
            } else if (signal.kind === 'candidate' && signal.candidate) {
                await peerConnection.addIceCandidate(signal.candidate);
            } else if (signal.kind === 'stop') {
                this.options.onConnectionClosed();
            }
        } catch (error) {
            logger.error('screenshareConnection failed to process signal', {
                error,
                kind: signal.kind
            });
        }
    }

    /**
     * Sends a screenshare signal out to the Spot-TV to be relayed into the
     * Jitsi-Meet meeting.
     *
     * @param signal - The {@code ScreenshareSignal} to send.
     * @private
     * @returns {void}
     */
    _send(signal: ScreenshareSignal): void {
        if (this._spotJid) {
            this.options.sendMessage(this._spotJid, signal);
        }
    }
}
