import { globalDebugger } from 'common/debugging';
import { logger } from 'common/logger';

import { BaseRemoteControlService } from './BaseRemoteControlService';
import { COMMANDS, MESSAGES } from './constants';
import ScreenshareService from './screenshare-connection';

/**
 * @typedef {Object} GoToMeetingOptions
 * @property {string} startWithScreensharing - if 'wireless' the meeting will be joined with
 * the wireless screensharing turned on. If 'wired' will be joined with wired. The meeting will be
 * joined without screensharing for any other value or lack of thereof.
 */


/**
 * Communication service for the Spot-Remote to talk to Spot-TV.
 *
 * @extends BaseRemoteControlService
 */
export class SpotRemoteRemoteControlService extends BaseRemoteControlService {
    /**
     * Initializes a new {@code SpotRemoteRemoteControlService} instance.
     */
    constructor() {
        super();

        /**
         * Prevents from triggering more than one go to meeting actions at the same time.
         * @type {Promise|null}
         * @private
         */
        this._goToMeetingPromise = null;

        this._wirelessScreensharingConfiguration = null;
    }

    /**
     * Requests a Spot-TV to change its audio level to a specific direction.
     *
     * @param {string} direction - The direction of the volume adjustment.
     * One of 'up' or 'down'.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    adjustVolume(direction) {
        return this.xmppConnection.sendCommand(
            this._getSpotId(), COMMANDS.ADJUST_VOLUME, { direction });
    }

    /**
     * Stores options related to wireless screensharing which will be to passed
     * into the wireless screensharing service upon screenshare start.
     *
     * @param {Object} configuration - A configuration file for how the wireless
     * screensharing should be captured.
     * @param {Object} configuration.maxFps - The maximum number of frame per
     * second which should be captured from the sharer's device.
     * @returns {void}
     */
    configureWirelessScreensharing(configuration = {}) {
        this._wirelessScreensharingConfiguration = configuration;
    }

    /**
     * Stops any active {@code ScreenshareConnection}.
     *
     * @returns {void}
     */
    destroyWirelessScreenshareConnections() {
        if (this._screenshareConnection) {
            this._screenshareConnection.stop();
            this._screenshareConnection = null;
        }

        if (this._startWithScreenshare) {
            this._startWithScreenshare.stop();
            this._startWithScreenshare = null;
        }
    }

    /**
     * Stops the XMPP connection.
     *
     * @override
     * @returns {void}
     */
    disconnect() {
        this.destroyWirelessScreenshareConnections();

        super.disconnect();
    }

    /**
     * Requests a Spot to join a meeting.
     *
     * @param {string} meetingName - The meeting to join.
     * @param {GoToMeetingOptions} options - Additional details about how to join the
     * meeting.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    goToMeeting(meetingName, options = {}) {
        if (this._goToMeetingPromise) {
            return Promise.reject('Another goToMeeting action is still in progress');
        }

        const { startWithScreensharing, ...otherOptions } = options;
        let preGoToMeeting = Promise.resolve();

        if (startWithScreensharing === 'wireless') {
            const connection = this._createScreensharingService(otherOptions);

            preGoToMeeting = connection.createTracks()
                .then(() => {
                    this._startWithScreenshare = connection;
                });
        }

        this._goToMeetingPromise
            = preGoToMeeting
                .then(() => this.xmppConnection.sendCommand(
                        this._getSpotId(),
                        COMMANDS.GO_TO_MEETING,
                        {
                            startWithScreensharing: startWithScreensharing === 'wired',
                            startWithVideoMuted: startWithScreensharing === 'wireless',
                            ...otherOptions,
                            meetingName
                        })
                )
            .then(() => {
                this._goToMeetingPromise = null;
            }, error => {
                this._goToMeetingPromise = null;
                throw error;
            });

        return this._goToMeetingPromise;
    }

    /**
     * Requests a Spot-TV to leave a meeting in progress.
     *
     * @param {boolean} skipFeedback - Whether or not to immediately navigate
     * out of the meeting instead of display feedback entry.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    hangUp(skipFeedback = false) {
        this.destroyWirelessScreenshareConnections();

        return this.xmppConnection.sendCommand(
            this._getSpotId(),
            COMMANDS.HANG_UP,
            {
                skipFeedback
            }
        );
    }

    /**
     * Requests a Spot-TV to change its audio mute status.
     *
     * @param {boolean} mute - Whether or not Spot should be audio muted.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    setAudioMute(mute) {
        return this.xmppConnection.sendCommand(
            this._getSpotId(), COMMANDS.SET_AUDIO_MUTE, { mute });
    }

    /**
     * Requests a Spot-TV to change its screensharing status. Turning on the
     * screensharing will enable wired screensharing, while turning off applies
     * to both wired and wireless screensharing.
     *
     * @param {boolean} screensharing - Whether or not Spot-TV should start or
     * stop screensharing.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    setScreensharing(screensharing) {
        return this.xmppConnection.sendCommand(
            this._getSpotId(),
            COMMANDS.SET_SCREENSHARING,
            { on: screensharing }
        );
    }

    /**
     * Requests a Spot-TV to enter or exit tile view mode.
     *
     * @param {boolean} tileView - Whether or not Spot-TV should be in or not be
     * in tile view.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    setTileView(tileView) {
        return this.xmppConnection.sendCommand(
            this._getSpotId(),
            COMMANDS.SET_TILE_VIEW,
            { tileView }
        );
    }

    /**
     * Requests a Spot-TV to change its video mute status.
     *
     * @param {boolean} mute - Whether or not Spot should be video muted.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    setVideoMute(mute) {
        return this.xmppConnection.sendCommand(
            this._getSpotId(), COMMANDS.SET_VIDEO_MUTE, { mute });
    }

    /**
     * Begins or stops the process for a Spot-Remote to connect to the local
     * in-meeting Jitsi in order to directly share a local screen.
     *
     * @param {boolean} enable - Whether to start ot stop screensharing.
     * @param {Object} options - Additional configuration to use for creating
     * the screenshare connection.
     * @returns {Promise}
     */
    setWirelessScreensharing(enable, options) {
        return enable
            ? this._startWirelessScreenshare(undefined, options)
            : this._stopWirelessScreenshare();
    }

    /**
     * Triggers any stored wireless screesharing connections to start the
     * process of establishing a connection to a a local Jitsi meeting
     * participant.
     *
     * @returns {void}
     */
    startAnyDeferredWirelessScreenshare() {
        if (!this._startWithScreenshare) {
            // No wireless screenshare to start.
            return;
        }

        this._startWirelessScreenshare(this._startWithScreenshare)
            .then(() => logger.log('Start with screensharing successful'))
            .catch(error => logger.error(
                'Failed to start with screensharing', { error }));

        this._startWithScreenshare = null;
    }

    /**
     * Requests a Spot-TV to submit post-meeting feedback.
     *
     * @param {Object} feedback - The feedback to submit.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    submitFeedback(feedback) {
        return this.xmppConnection.sendCommand(
            this._getSpotId(), COMMANDS.SUBMIT_FEEDBACK, feedback);
    }

    /**
     * Invoked by a Spot-Remote to initialize a new {@link ScreenshareService}
     * instance.
     *
     * @param {Object} options - Additional configuration to use for creating
     * the screenshare connection.
     * @private
     * @returns {ScreenshareService}
     */
    _createScreensharingService(options = {}) {
        return new ScreenshareService({
            mediaConfiguration:
                this._wirelessScreensharingConfiguration || {},

            /**
             * The {@code JitsiConnection} instance will be used to fetch TURN credentials.
             */
            jitsiConnection: this.xmppConnection.getJitsiConnection(),

            /**
             * Callback invoked when the connection has been closed
             * automatically. Triggers cleanup of {@code ScreenshareService}.
             *
             * @returns {void}
             */
            onConnectionClosed: () => {
                this._stopWirelessScreenshare();
                options.onClose && options.onClose();
            },

            /**
             * Callback invoked by {@code ScreenshareService} in order to
             * communicate out to a Spot-TV an update about the screensharing
             * connection.
             *
             * @param {string} to - The Spot-TV jid to send the message to.
             * @param {Object} data - A payload to send along with the
             * message.
             * @returns {Promise}
             */
            sendMessage: (to, data) =>
                this.xmppConnection.sendMessage(
                    to,
                    MESSAGES.REMOTE_CONTROL_UPDATE,
                    data
                ).catch(error => logger.error(
                    'Failed to send screensharing message', { error }))
        });
    }

    /**
     * Begins the process of Spot-Remote creating a direct connection to the
     * local in-meeting Jitsi participant.
     *
     * @param {ScreenshareConnection} connection - Optionally use an existing
     * instance of ScreenshareConnection instead of instantiating one. This
     * would be used when creating a desktop track to stream first but the
     * actual connection to the JItsi participant must occur later.
     * @param {Object} options - Additional configuration to use for creating
     * the screenshare connection.
     * @private
     * @returns {Promise}
     */
    _startWirelessScreenshare(connection, options) {
        if (this._screenshareConnection) {
            logger.error('Already started wireless screenshare');

            return Promise.reject('Already started wireless screenshare');
        }

        this._screenshareConnection
            = connection || this._createScreensharingService(options);

        return this._screenshareConnection.startScreenshare(this._getSpotId())
            .catch(error => {
                logger.error(
                    'Could not establish wireless screenshare connection',
                    { error }
                );

                this.destroyWirelessScreenshareConnections();

                return Promise.reject(error);
            });
    }

    /**
     * Cleans up screensharing connections between the Spot-Remote and Jitsi
     * participant that are pending or have successfully been made.
     *
     * @private
     * @returns {Promise}
     */
    _stopWirelessScreenshare() {
        this.destroyWirelessScreenshareConnections();

        return this.setScreensharing(false);
    }
}

const spotRemoteRemoteControlService = new SpotRemoteRemoteControlService();

globalDebugger.register(
    'spotRemoteRemoteControlService', spotRemoteRemoteControlService);

export default spotRemoteRemoteControlService;
