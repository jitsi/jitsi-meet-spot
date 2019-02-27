import { logger } from 'common/logger';
import { JitsiMeetJSProvider } from 'common/vendor';

/**
 * Manages the ProxyConnectionService between between a remote control and a
 * participant in a Jitsi-Meet meeting.
 */
export default class ScreenshareConnection {
    /**
     * Initializes a new {@code ScreenshareConnection} instance.
     *
     * @param {Object} options - Configuration to initialize with.
     * @param {Object} options.mediaConfiguration - Describes how the desktop
     * sharing source should be captured.
     * @param {Object} options.mediaConfiguration.desktopSharingFrameRate - The
     * frames per second which should be captured from the desktop sharing
     * source. Can include a "max" and "min" key, both being numbers.
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
        this._isActive = false;

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
        logger.log(
            `screenshareConnection got message ${JSON.stringify(message)}`);

        this._proxyConnectionService.processMessage(message);
    }

    /**
     * See the description of {@link _createTracks}.
     *
     * @public
     * @returns {Promise} - See the return description of {@link _createTracks}.
     */
    createTracks() {
        return this._createTracks(/* deferred start */ true);
    }

    /**
     * Asks the user to select the desktop to be used for screensharing and creates the tracks.
     * The tracks are stored in this connection instance and will be used when
     * the {@code startScreenshare} method is called.
     *
     * @param {boolean} deferredStart - Whether or not this call is made in the deferred start
     * scenario where the tracks are created, before the connection gets established.
     * @private
     * @returns {Promise} - Resolved when user selects the desktop and the tracks are created
     * successfully. The promise is rejected if user cancels the desktop picker or something goes
     * wrong on the lib-jitsi-meet side with creating the tracks.
     */
    _createTracks(deferredStart) {
        if (this._tracks.length) {
            return Promise.resolve();
        }

        const JitsiMeetJS = JitsiMeetJSProvider.get();

        return JitsiMeetJS.createLocalTracks({
            ...this.options.mediaConfiguration,
            devices: [ 'desktop' ]
        }).then(jitsiLocalTracks => {
            logger.log('screenshareConnection created desktop track');

            this._tracks = this._tracks.concat(jitsiLocalTracks);

            /**
             * Clean up the tracks and {@code ProxyConnectionService} in
             * case the connection was lost while selecting a screenshare
             * source.
             */
            if (!this._isActive && !deferredStart) {
                logger.log('screenshareConnection got track in inactive state');

                this.stop();

                return;
            }

            jitsiLocalTracks[0].on(
                JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                () => {
                    logger.log('screenshareConnection desktop stopped');

                    /**
                     * Assume the connection was lost if LOCAL_TRACK_STOPPED
                     * fires but stop() was not explicitly called.
                     */
                    if (this._isActive) {
                        this.options.onConnectionClosed();
                    } else if (this.deferredStart) {
                        // The track can be stopped using Chrome's "Stop sharing" button.
                        // The screensharing needs to be aborted in that case which is done be
                        // rejecting the deferred start promise.
                        this.deferredStart.cancel();
                        this.deferredStart = undefined;
                    }
                }
            );
        });
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
        logger.log(`screenshareConnection started ${spotJid}`);

        this._isActive = true;

        return new Promise((resolve, reject) => {
            const preStart
                = this._tracks.length
                    ? Promise.resolve()
                    : this._createTracks(/* deferred start */ false);

            preStart.then(
                () => {
                    this._proxyConnectionService.start(
                        spotJid,
                        this._tracks
                    );
                    resolve();
                },
                error => {
                    // FIXME the tracks are not disposed, maybe consider calling stop() ?
                    this._isActive = false;
                    reject(error);
                });
        });
    }

    /**
     * Creates a deferred start Promise which is resolved when screensharing is started or rejected
     * if the process fails or is aborted for other reasons.
     * Stores locally a deferred start object with {@code resume} and {@code cancel} methods.
     * The resume method is used to resume the screensharing initialization when the meeting is
     * joined on the remote side and the external API is ready to accept the screensharing stream.
     * When {@code cancel} method is called it will reject the Promise returned by this method.
     *
     * @param {string} spotId - See the description at {@link startScreenshare}.
     * @returns {Promise} - A Promise resolved when the screensharing is started or reject if fails
     * or if the process is aborted.
     */
    createDeferredStart(spotId) {
        const self = this;

        return new Promise((resolve, reject) => {
            this.deferredStart = {
                resume() {
                    self.startScreenshare(spotId).then(resolve, reject);
                },
                cancel() {
                    reject('Pending screenshare has been canceled');
                }
            };
        });
    }

    /**
     * Cleans up the state of this {@code ScreenshareConnection} instance by
     * stopping all known media tracks and stopping any active proxy connection.
     *
     * @returns {void}
     */
    stop() {
        logger.log('screenshareConnection stopping');

        this._isActive = false;
        this._proxyConnectionService.stop();

        this.deferredStart && this.deferredStart.cancel();
        this.deferredStart = undefined;

        this._tracks.forEach(track => track.dispose());
        this._tracks = [];
    }
}
