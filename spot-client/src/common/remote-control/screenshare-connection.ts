import { logger } from 'common/logger';
import { avUtils } from 'common/media';
import { JitsiMeetJSProvider } from 'common/vendor';

interface ScreenshareConnectionOptions {
    jitsiConnection: any;
    mediaConfiguration: any;
    onConnectionClosed: () => void;
    sendMessage: (to: any, data: any) => void;
}

/**
 * Manages the ProxyConnectionService between between a remote control and a
 * participant in a Jitsi-Meet meeting.
 */
export default class ScreenshareConnection {
    options: ScreenshareConnectionOptions;
    _isActive: boolean;
    _tracks: any[];
    _proxyConnectionService: any;

    /**
     * Initializes a new {@code ScreenshareConnection} instance.
     *
     * @param options - Configuration to initialize with.
     * @param options.jitsiConnection - The JitsiConnection instance which will be
     * used to fetch TURN credentials.
     * @param options.mediaConfiguration - Describes how the desktop
     * sharing source should be captured.
     * @param options.mediaConfiguration.desktopSharingFrameRate - The
     * frames per second which should be captured from the desktop sharing
     * source. Can include a "max" and "min" key, both being numbers.
     * @param options.sendMessage - Callback invoked when the
     * {@code ProxyConnectionService} needs to send a message out to Jitsi-Meet.
     * @param options.onConnectionClosed - Callback to invoke when a
     * the connection or part of the connection has closed itself.
     */
    constructor(options: ScreenshareConnectionOptions) {
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
                jitsiConnection: options.jitsiConnection,
                onConnectionClosed: () => this.options.onConnectionClosed(),
                onRemoteStream: () => { /** No-op for Spot. */ },
                onSendMessage: (to: any, data: any) => this.options.sendMessage(to, data)
            });
    }

    /**
     * Forwards status messages for updating the screenshare connection.
     *
     * @param message - A message object regarding establishing or
     * updating a proxy connection.
     * @param message.data - An object containing additional message
     * details.
     * @param message.data.iq - The stringified iq which explains how
     * and what to update regarding the proxy connection.
     * @param message.from - The message sender's full jid. Used for
     * sending replies.
     * @returns {void}
     */
    processMessage(message: any): void {
        logger.log('screenshare connection got message', { message });

        this._proxyConnectionService.processMessage(message);
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
     * Asks the user to select the desktop to be used for screensharing and creates the tracks.
     * The tracks are stored in this connection instance and will be used when
     * the {@code startScreenshare} method is called.
     *
     * @param deferredStart - Whether or not this call is made in the deferred start
     * scenario where the tracks are created, before the connection gets established.
     * @private
     * @returns - Resolved when user selects the desktop and the tracks are created
     * successfully. The promise is rejected if user cancels the desktop picker or something goes
     * wrong on the lib-jitsi-meet side with creating the tracks.
     */
    _createTracks(deferredStart: boolean): Promise<void> {
        if (this._tracks.length) {
            return Promise.resolve();
        }

        return avUtils.createLocalDesktopTrack(
            this.options.mediaConfiguration
        ).then((jitsiLocalTrack: any) => {
            logger.log('screenshareConnection created desktop track');

            this._tracks = this._tracks.concat([ jitsiLocalTrack ]);

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

            jitsiLocalTrack.on(
                avUtils.getTrackEvents().LOCAL_TRACK_STOPPED,
                () => {
                    logger.log('screenshareConnection desktop stopped');

                    /**
                     * Assume the connection was lost if LOCAL_TRACK_STOPPED
                     * fires but stop() was not explicitly called.
                     */
                    if (this._isActive || deferredStart) {
                        this.options.onConnectionClosed();
                    }
                }
            );
        });
    }

    /**
     * Begins the process of establishing a direct connection with a participant
     * in a Jitsi-Meet meeting.
     *
     * @param spotJid - The jid of the Spot instance which should
     * receive messages to act as signaling. Spot will then pass the message
     * along to the Jitsi-Meet meeting.
     * @returns {Promise}
     */
    startScreenshare(spotJid: string): Promise<void> {
        logger.log('screenshare connection started', { spotJid });

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
     * Cleans up the state of this {@code ScreenshareConnection} instance by
     * stopping all known media tracks and stopping any active proxy connection.
     *
     * @returns {void}
     */
    stop(): void {
        logger.log('screenshareConnection stopping');

        this._isActive = false;
        this._proxyConnectionService.stop();

        this._tracks.forEach((track: any) => track.dispose());
        this._tracks = [];
    }
}
