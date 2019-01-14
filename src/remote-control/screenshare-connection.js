import { JitsiMeetJSProvider } from 'vendor';

/**
 * Manages the ProxyConnectionService between between a remote control and a
 * participant in a Jitsi-Meet meeting.
 */
export default class ScreenshareConnection {
    /**
     * Initializes a new {@code ScreenshareConnection} instance.
     *
     * @param {Object} options - Configuration to initialize with.
     * @param {Function} options.sendMessage - Callback invoked when the
     * {@code ProxyConnectionService} needs to send a message out to Jitsi-Meet.
     * @param {Function} options.onConnectionClosed - Callback to invoke when a
     * the connection or part of the connection has closed itself.
     */
    constructor(options) {
        this.options = options;

        /**
         * Whether or not the {@code ProxyConnectionService} has an active
         * connection. Used to prevent connection events from firing after the
         * connection has been stopped.
         *
         * @type {boolean}
         */
        this._isStopped = true;

        /**
         * Holds a reference to created desktop streams so that they may be
         * cleaned up when the connection is closed.
         *
         * @type {Array<JitsiLocalTrack>}
         */
        this._tracks = [];

        const JitsiMeetJS = JitsiMeetJSProvider.get();

        this._proxyConnectionService
            = new JitsiMeetJS.ProxyConnectionService({
                onConnectionClosed: () => this.options.onConnectionClosed(),
                onSendMessage: (to, data) => this.options.sendMessage(to, data),
                onRemoteStream() { /** no-op */ }
            });
    }

    /**
     * Forwards status messages for updating the screenshare connection.
     *
     * @param {Object} message - A message object regarding establishing or
     * updating a proxy connection.
     * @param {Object} message.data - An object containing additional message
     * details.
     * @param {string} message.data.iq - The stringified iq which explains how
     * and what to update regarding the proxy connection.
     * @param {string} message.from - The message sender's full jid. Used for
     * sending replies.
     * @returns {void}
     */
    processMessage(message) {
        this._proxyConnectionService.processMessage(message);
    }

    /**
     * Begins the process of establishing a direct connection with a participant
     * in a Jitsi-Meet meeting.
     *
     * @param {string} spotJid - The jid of the Spot instance which should
     * receive messages to act as signaling. Spot will then pass the message
     * along to the Jitsi-Meet meeting.
     * @returns {Promise}
     */
    startScreenshare(spotJid) {
        this._isStopped = false;

        const JitsiMeetJS = JitsiMeetJSProvider.get();

        return JitsiMeetJS.createLocalTracks({ devices: [ 'desktop' ] })
            .then(jitsiLocalTracks => {
                this._tracks = this._tracks.concat(jitsiLocalTracks);

                /**
                 * Clean up the tracks and {@code ProxyConnectionService} in
                 * case the connection was lost while selecting a screenshare
                 * source.
                 */
                if (this._isStopped) {
                    this.stop();

                    return;
                }

                jitsiLocalTracks[0].on(
                    JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                    () => {

                        /**
                         * Assume the connection was lost if LOCAL_TRACK_STOPPED
                         * fires but stop() was not explicitly called.
                         */
                        if (!this._isStopped) {
                            this.options.onConnectionClosed();
                        }
                    }
                );

                this._proxyConnectionService.start(
                    spotJid,
                    jitsiLocalTracks
                );
            });
    }

    /**
     * Cleans up the state of this {@code ScreenshareConnection} instance by
     * stopping all known media tracks and stopping any active proxy connection.
     *
     * @returns {void}
     */
    stop() {
        this._isStopped = true;
        this._proxyConnectionService.stop();

        this._tracks.forEach(track => track.dispose());
        this._tracks = [];
    }
}
