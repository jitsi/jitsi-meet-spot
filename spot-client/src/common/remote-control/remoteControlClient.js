import { globalDebugger } from 'common/debugging';
import { logger } from 'common/logger';

import { BaseRemoteControlService } from './BaseRemoteControlService';
import {
    COMMANDS,
    CONNECTION_EVENTS,
    MESSAGES,
    SERVICE_UPDATES
} from './constants';
import ScreenshareService from './screenshare-connection';

/**
 * @typedef {Object} GoToMeetingOptions
 * @property {string} startWithScreensharing - if 'wireless' the meeting will be joined with
 * the wireless screensharing turned on. If 'wired' will be joined with wired. The meeting will be
 * joined without screensharing for any other value or lack of thereof.
 */


/**
 * Communication service to send commands and receive updates from an instance
 * of {@code RemoteControlServer}.
 *
 * @extends BaseRemoteControlService
 */
export class RemoteControlClient extends BaseRemoteControlService {
    /**
     * Initializes a new {@code RemoteControlClient} instance.
     */
    constructor() {
        super();

        /**
         * Prevents from triggering more than one go to meeting actions at the same time.
         *
         * @type {Promise|null}
         * @private
         */
        this._goToMeetingPromise = null;

        this._lastSpotState = null;

        this._wirelessScreensharingConfiguration = null;
    }

    /**
     * Requests the {@code RemoteControlServer} to change its audio level to a
     * specific direction.
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
     * @inheritdoc
     * @override
     */
    disconnect() {
        this.destroyWirelessScreenshareConnections();
        this._lastSpotState = null;

        return super.disconnect();
    }

    /**
     * Converts a join code to Spot-TV connection information so it can be connected to by
     * a Spot-Remote.
     *
     * @param {string} code - The join code to exchange for connection information.
     * @returns {Promise<RoomInfo>} Resolve with join information or an error.
     */
    exchangeCodeWithXmpp(code) {
        if (code.length === 6) {
            return Promise.resolve({
                roomName: code.substring(0, 3),
                roomLock: code.substring(3, 6)
            });
        }

        // The 'not-authorized' error is returned by the server if the code is wrong.
        // Return the same error if it's known that the code is invalid before submitting to the server.
        return Promise.reject('not-authorized');
    }

    /**
     * Implements a way to get the current join code to connect to the
     * {@code RemoteControlServer}.
     *
     * @inheritdoc
     * @override
     */
    getJoinCode() {
        return (this._lastSpotState && this._lastSpotState.joinCode)
            || this._options.joinCode;
    }

    /**
     * Requests a {@code RemoteControlServer} to join a meeting.
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
     * Requests a {@code RemoteControlServer} to leave a meeting in progress.
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
     * Requests a {@code RemoteControlServer} to change its audio mute status.
     *
     * @param {boolean} mute - Whether or not Spot should be audio muted.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    setAudioMute(mute) {
        return this.xmppConnection.sendCommand(
            this._getSpotId(), COMMANDS.SET_AUDIO_MUTE, { mute });
    }

    /**
     * Requests a {@code RemoteControlServer} to change its screensharing status.
     * Turning on the screensharing will enable wired screensharing, while
     * turning off applies to both wired and wireless screensharing.
     *
     * @param {boolean} screensharing - Whether or not {@code RemoteControlServer}
     * should start or stop screensharing.
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
     * Requests a {@code RemoteControlServer} to enter or exit tile view mode.
     *
     * @param {boolean} tileView - Whether or not {@code RemoteControlServer}
     * should be in or not be in tile view.
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
     * Requests a {@code RemoteControlServer} to change its video mute status.
     *
     * @param {boolean} mute - Whether or not {@code RemoteControlServer} should
     * be video muted.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    setVideoMute(mute) {
        return this.xmppConnection.sendCommand(
            this._getSpotId(), COMMANDS.SET_VIDEO_MUTE, { mute });
    }

    /**
     * Begins or stops the process for a {@code RemoteControlClient} to connect
     * to the Jitsi-Meet participant in order to directly share a local screen.
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
     * process of establishing a connection to a Jitsi-Meet meeting participant.
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
     * Requests a {@code RemoteControlServer} to submit post-meeting feedback.
     *
     * @param {Object} feedback - The feedback to submit.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    submitFeedback(feedback) {
        return this.xmppConnection.sendCommand(
            this._getSpotId(), COMMANDS.SUBMIT_FEEDBACK, feedback);
    }

    /**
     * Initialize a new {@link ScreenshareService} instance.
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
             * communicate out to a {@code RemoteControlServer} an update about
             * the screensharing connection.
             *
             * @param {string} to - The {@code RemoteControlServer} jid to send
             * the message to.
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
     * Get the {@code RemoteControlServer} jid for which to send commands and
     * messages.
     *
     * @private
     * @returns {string|null}
     */
    _getSpotId() {
        return this._lastSpotState && this._lastSpotState.spotId;
    }

    /**
     * Implements {@link BaseRemoteControlService#_onPresenceReceived}.
     *
     * @inheritdoc
     */
    _onPresenceReceived(presence) {
        const updateType = presence.getAttribute('type');

        if (updateType === 'unavailable') {
            const from = presence.getAttribute('from');

            if (this._getSpotId() === from) {
                this._onDisconnect(CONNECTION_EVENTS.SERVER_DISCONNECTED);
            }

            return;
        }

        if (updateType === 'error') {
            logger.log(
                'error presence received, interpreting as disconnect');
            this._onDisconnect(CONNECTION_EVENTS.SERVER_DISCONNECTED);

            return;
        }

        const status = Array.from(presence.children).map(child =>
            [ child.tagName, child.textContent ])
            .reduce((acc, current) => {
                acc[current[0]] = current[1];

                return acc;
            }, {});

        if (status.isSpot !== 'true') {
            // Ignore presence from others not identified as a
            // {@code RemoteControlServer}.
            return;
        }

        const spotTvJid = presence.getAttribute('from');

        // Redundantly update the known {@code RemoteControlServer} jid in case
        // there are multiple due to ghosts left form disconnect, in which case
        // the active {@code RemoteControlServer} should be emitting updates.
        this._lastSpotState = {
            ...status,
            spotId: spotTvJid
        };

        this.emit(
            SERVICE_UPDATES.SERVER_STATE_CHANGE,
            {
                updatedState: this._lastSpotState
            }
        );
    }


    /**
     * Processes screenshare related updates from the Jitsi-Meet participant.
     *
     * @override
     * @inheritdoc
     */
    _processMessage(messageType, from, data) {
        switch (messageType) {
        case MESSAGES.JITSI_MEET_UPDATE:
            this._screenshareConnection
                && this._screenshareConnection.processMessage({
                    data,
                    from
                });
            break;
        }
    }

    /**
     * Begins the process of creating a direct connection to the  Jitsi-Meet
     * participant.
     *
     * @param {ScreenshareConnection} connection - Optionally use an existing
     * instance of ScreenshareConnection instead of instantiating one. This
     * would be used when creating a desktop track to stream first but the
     * actual connection to the Jitsi participant must occur later.
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
     * Cleans up screensharing connections between the {@code RemoteControlClient}
     * and Jitsi-Meet participant that are pending or have successfully been made.
     *
     * @private
     * @returns {Promise}
     */
    _stopWirelessScreenshare() {
        this.destroyWirelessScreenshareConnections();

        return this.setScreensharing(false);
    }
}

const remoteControlClient = new RemoteControlClient();

globalDebugger.register('remoteControlClient', remoteControlClient);

export default remoteControlClient;
