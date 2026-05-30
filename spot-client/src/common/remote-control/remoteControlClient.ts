import { globalDebugger } from 'common/debugging';
import { logger } from 'common/logger';

import { BaseRemoteControlService } from './BaseRemoteControlService';
import P2PReconnectTrait from './P2PReconnectTrait';
import P2PSignalingBase from './P2PSignalingBase';
import P2PSignalingClient from './P2PSignalingClient';
import {
    COMMANDS,
    CONNECTION_EVENTS,
    MESSAGES,
    SERVICE_UPDATES
} from './constants';
import ScreenshareService from './screenshare-connection';

/**
 * @typedef {Object} GoToMeetingOptions
 * @property {string} startWithScreensharing - If 'wireless' the meeting will be joined with
 * the wireless screensharing turned on. If 'wired' will be joined with wired. The meeting will be
 * joined without screensharing for any other value or lack of thereof.
 */
interface GoToMeetingOptions {
    startWithScreensharing?: string;
    [key: string]: any;
}

/**
 * Communication service to send commands and receive updates from an instance
 * of {@code RemoteControlServer}.
 */
export class RemoteControlClient extends BaseRemoteControlService {
    _goToMeetingPromise: Promise<any> | null;
    _lastSpotState: any;
    _wirelessScreensharingConfiguration: any;
    _waitForSpotTvTimeout: ReturnType<typeof setTimeout> | null;
    _spotTvP2PRetry: P2PReconnectTrait | null;
    _screenshareConnection: any;
    _startWithScreenshare: any;

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

        /**
         * A timeout triggered in "no backend" mode which will trigger a disconnect if Spot TV presence does not arrive
         * within 5 seconds since the MUC has been joined.
         *
         * @type {number|null}
         * @private
         */
        this._waitForSpotTvTimeout = null;

        /**
         * The P2P reconnect trait which will start the P2P connection when Spot TV joins the room as well as make sure
         * to reconnect in case the connection goes down.
         *
         * @type {P2PReconnectTrait|null}
         * @private
         */
        this._spotTvP2PRetry = null;
    }

    /**
     * Requests the {@code RemoteControlServer} to change its audio level to a
     * specific direction.
     *
     * @param direction - The direction of the volume adjustment.
     * One of 'up' or 'down'.
     * @returns Resolves if the command has been acknowledged.
     */
    adjustVolume(direction: string): Promise<any> {
        return this._sendCommand(COMMANDS.ADJUST_VOLUME, { direction });
    }

    /**
     * Stores options related to wireless screensharing which will be to passed
     * into the wireless screensharing service upon screenshare start.
     *
     * @param configuration - A configuration file for how the wireless
     * screensharing should be captured.
     * @param configuration.maxFps - The maximum number of frame per
     * second which should be captured from the sharer's device.
     * @returns {void}
     */
    configureWirelessScreensharing(configuration: any = {}): void {
        this._wirelessScreensharingConfiguration = configuration;
    }

    /**
     * Extends the connection promise with Spot Remote specific functionality.
     *
     * @param options - Information necessary for creating the connection.
     * @returns {Promise<RoomProfile>}
     * @protected
     */
    _createConnectionPromise(options: any): Promise<any> {
        return super._createConnectionPromise(options)
            .then((roomProfile: any) => {
                if (!options.backend) {
                    this._setWaitForSpotTvTimeout();
                }

                return roomProfile;
            });
    }

    /**
     * Initializes P2P signaling instance.
     *
     * @protected
     * @returns {void}
     */
    _createP2PSignaling(): void {
        super._createP2PSignaling();

        this._p2pSignaling.addListener(
                P2PSignalingClient.SPOT_TV_STATUS_UPDATE,
                this._onSpotTvStatusReceived.bind(this));

        this._p2pSignaling.addListener(
            P2PSignalingBase.DATA_CHANNEL_READY_UPDATE,
            () => {
                this.emit(
                    SERVICE_UPDATES.P2P_SIGNALING_STATE_CHANGE,
                    this._p2pSignaling && this._p2pSignaling.isReady());
            });

        this._spotTvP2PRetry = new P2PReconnectTrait(this._p2pSignaling, this.xmppConnection);
    }

    /**
     * Stops any active {@code ScreenshareConnection}.
     *
     * @returns {void}
     */
    destroyWirelessScreenshareConnections(): void {
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
    disconnect(event?: any): Promise<any> {
        this.destroyWirelessScreenshareConnections();
        this._resetSpotTvState();

        if (this._spotTvP2PRetry) {
            this._spotTvP2PRetry.deactivate();
        }
        this._spotTvP2PRetry = null;

        return super.disconnect(event);
    }

    /**
     * Converts a join code to Spot-TV connection information so it can be connected to by
     * a Spot-Remote.
     *
     * @param code - The join code to exchange for connection information.
     * @returns {Promise<RoomInfo>} Resolve with join information or an error.
     */
    exchangeCodeWithXmpp(code: string): Promise<any> {
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
    getJoinCode(): string {
        return (this._lastSpotState && this._lastSpotState.remoteJoinCode)
            || this._options?.joinCode || '';
    }

    /**
     * Requests a {@code RemoteControlServer} to join a meeting.
     *
     * @param meetingName - The meeting to join.
     * @param options - Additional details about how to join the
     * meeting.
     * @returns Resolves if the command has been acknowledged.
     */
    goToMeeting(meetingName: string, options: GoToMeetingOptions = {}): Promise<any> {
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
                .then(() => this._sendCommand(
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
     * Returns the type of P2P signaling supported by RCS client.
     *
     * @returns {P2PSignalingClient}
     * @private
     */
    _getP2PSignalingType(): typeof P2PSignalingClient {
        return P2PSignalingClient;
    }

    /**
     * Requests a {@code RemoteControlServer} to leave a meeting in progress.
     *
     * @param options - How the hangup should occur.
     * @param options.skipFeedback - Whether or not to immediately
     * navigate out of the meeting instead of display feedback entry.
     * @param options.onlyIfLonelyCall - If true, hangup will occur
     * only if there are no remote participants in the call.
     * @returns Resolves if the command has been acknowledged.
     */
    hangUp(options: any = {}): Promise<any> {
        this.destroyWirelessScreenshareConnections();

        return this._sendCommand(
            COMMANDS.HANG_UP,
            options
        );
    }

    /**
     * Clears the stored Spot TV state and emits update event.
     *
     * @private
     * @returns {void}
     */
    _resetSpotTvState(): void {
        this._lastSpotState = {
            spotId: undefined
        };
        this.emit(
            SERVICE_UPDATES.SERVER_STATE_CHANGE,
            {
                updatedState: this._lastSpotState
            }
        );
    }

    /**
     * Sends RCS command.
     *
     * @param command - The RCs command type as defined in {@link COMMANDS}.
     * @param data - Any extra command data to be sent.
     * @returns {Promise<Object>}
     */
    _sendCommand(command: string, data?: any): Promise<any> {
        if (this._p2pSignaling && this._p2pSignaling.isReady()) {
            return this._p2pSignaling.sendCommand(command, data);
        }

        return this.xmppConnection.sendCommand(this._getSpotId(), command, data);
    }

    /**
     * Requests a {@code RemoteControlServer} to grant or consent
     * for recording the meeting.
     *
     * @param unmute - Whether or not to also unmute the devices.
     * @returns Resolves if the command has been acknowledged.
     */
    grantRecordingConsent(unmute: boolean): Promise<any> {
        return this._sendCommand(COMMANDS.GRANT_RECORDING_CONSENT, { unmute });
    }


    /**
     * Requests a {@code RemoteControlServer} to send touch tones into a meeting.
     * This is intended for interaction with an IVR requesting additional
     * conference details for dialing in.
     *
     * @param tones - The dial pad numbers to be submitted for playing
     * tones.
     * @returns Resolves if the command has been acknowledged.
     */
    sendTouchTones(tones: string): Promise<any> {
        return this._sendCommand(
            COMMANDS.SEND_TOUCH_TONES,
            { tones }
        );
    }

    /**
     * Requests a {@code RemoteControlServer} to change its audio mute status.
     *
     * @param mute - Whether or not Spot should be audio muted.
     * @returns Resolves if the command has been acknowledged.
     */
    setAudioMute(mute: boolean): Promise<any> {
        return this._sendCommand(COMMANDS.SET_AUDIO_MUTE, { mute });
    }

    /**
     * Requests a {@code RemoteControlServer} to raise or lower the hand.
     *
     * @param handRaised - Whether or not Spot should raise its hand.
     * @returns Resolves if the command has been acknowledged.
     * */
    setRaiseHand(handRaised: boolean): Promise<any> {
        return this._sendCommand(COMMANDS.SET_RAISE_HAND, { handRaised });
    }

    /**
     * Requests a {@code RemoteControlServer} to change its screensharing status.
     * Turning on the screensharing will enable wired screensharing, while
     * turning off applies to both wired and wireless screensharing.
     *
     * @param screensharing - Whether or not {@code RemoteControlServer}
     * should start or stop screensharing.
     * @returns Resolves if the command has been acknowledged.
     */
    setScreensharing(screensharing: boolean): Promise<any> {
        if (!screensharing) {
            this.destroyWirelessScreenshareConnections();
        }

        return this._sendCommand(
            COMMANDS.SET_SCREENSHARING,
            { on: screensharing }
        );
    }

    /**
     * Requests a {@code RemoteControlServer} to enter or exit tile view mode.
     *
     * @param tileView - Whether or not {@code RemoteControlServer}
     * should be in or not be in tile view.
     * @returns Resolves if the command has been acknowledged.
     */
    setTileView(tileView: boolean): Promise<any> {
        return this._sendCommand(COMMANDS.SET_TILE_VIEW, { tileView });
    }

    /**
     * Requests a {@code RemoteControlServer} to show or hide the whiteboard.
     *
     * @param whiteboardOpen - Whether or not the whiteboard should
     * be shown.
     * @returns Resolves if the command has been acknowledged.
     */
    setWhiteboard(whiteboardOpen: boolean): Promise<any> {
        return this._sendCommand(COMMANDS.SET_WHITEBOARD, { whiteboardOpen });
    }

    /**
     * Requests a {@code RemoteControlServer} to change its video mute status.
     *
     * @param mute - Whether or not {@code RemoteControlServer} should
     * be video muted.
     * @returns Resolves if the command has been acknowledged.
     */
    setVideoMute(mute: boolean): Promise<any> {
        return this._sendCommand(COMMANDS.SET_VIDEO_MUTE, { mute });
    }

    /**
     * Logic specific to the "no backend" mode.
     *
     * This sets a timeout which will trigger a disconnect if Spot TV presence does not arrive
     * within 5 seconds since the MUC was joined by Spot Remote.
     *
     * @returns {void}
     * @private
     */
    _setWaitForSpotTvTimeout(): void {
        if (!this._getSpotId()) {
            this._waitForSpotTvTimeout = setTimeout(() => {
                logger.error('Spot TV never joined the MUC');
                this._onDisconnect(CONNECTION_EVENTS.SERVER_DISCONNECTED);
            }, 5 * 1000);
        }
    }

    /**
     * Begins or stops the process for a {@code RemoteControlClient} to connect
     * to the Jitsi-Meet participant in order to directly share a local screen.
     *
     * @param enable - Whether to start ot stop screensharing.
     * @param options - Additional configuration to use for creating
     * the screenshare connection.
     * @returns {Promise}
     */
    setWirelessScreensharing(enable: boolean, options?: any): Promise<any> {
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
    startAnyDeferredWirelessScreenshare(): void {
        if (!this._startWithScreenshare) {
            // No wireless screenshare to start.
            return;
        }

        this._startWirelessScreenshare(this._startWithScreenshare)
            .then(() => logger.log('Start with screensharing successful'))
            .catch((error: any) => logger.error(
                'Failed to start with screensharing', { error }));

        this._startWithScreenshare = null;
    }

    /**
     * Requests a {@code RemoteControlServer} to submit post-meeting feedback.
     *
     * @param feedback - The feedback to submit.
     * @returns Resolves if the command has been acknowledged.
     */
    submitFeedback(feedback: any): Promise<any> {
        return this.xmppConnection
            ? this._sendCommand(COMMANDS.SUBMIT_FEEDBACK, feedback)
            : Promise.reject('No server connection for feedback');
    }

    /**
     * Requests a {@code RemoteControlServer} to submit a password to attempt
     * entry into a locked meeting.
     *
     * @param password - The password to submit.
     * @returns Resolves if the command has been acknowledged.
     */
    submitPassword(password: string): Promise<any> {
        return this._sendCommand(COMMANDS.SUBMIT_PASSWORD, password);
    }

    /**
     * Initialize a new {@link ScreenshareService} instance.
     *
     * @param options - Additional configuration to use for creating
     * the screenshare connection.
     * @private
     * @returns {ScreenshareService}
     */
    _createScreensharingService(options: any = {}): any {
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
                if (options.onClose) {
                    options.onClose();
                }
            },

            /**
             * Callback invoked by {@code ScreenshareService} in order to
             * communicate out to a {@code RemoteControlServer} an update about
             * the screensharing connection.
             *
             * @param to - The {@code RemoteControlServer} jid to send
             * the message to.
             * @param data - A payload to send along with the
             * message.
             * @returns {Promise}
             */
            sendMessage: (to: string, data: any) =>
                this.xmppConnection.sendMessage(
                    to,
                    MESSAGES.REMOTE_CONTROL_UPDATE,
                    data
                ).catch((error: any) => logger.error(
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
    _getSpotId(): string | null {
        return this._lastSpotState && this._lastSpotState.spotId;
    }

    /**
     * Implements {@link BaseRemoteControlService#_onPresenceReceived}.
     *
     * @inheritdoc
     */
    _onPresenceReceived({ from, localUpdate, state, type, unavailableReason }: any): void {
        if (type === 'unavailable') {
            if (this._getSpotId() === from) {
                this._onSpotTvLeftMuc(from);
            } else if (localUpdate && unavailableReason === 'kicked') {
                this._onDisconnect(CONNECTION_EVENTS.CLOSED_BY_SERVER);
            }

            return;
        }

        if (type === 'error') {
            logger.log(
                'error presence received, interpreting as disconnect');
            this._onDisconnect(CONNECTION_EVENTS.SERVER_DISCONNECTED);

            return;
        }

        if (!state.isSpot) {
            // Ignore presence from others not identified as a
            // {@code RemoteControlServer}.
            return;
        }

        this._onSpotTvStatusReceived(from, state);

        if (type === 'join') {
            this._onSpotTvJoinedMuc(from);
        }
    }

    /**
     * Called when Spot TV leaves the MUC.
     *
     * @param spotTvAddress - The Spot TV address.
     * @private
     * @returns {void}
     */
    _onSpotTvLeftMuc(spotTvAddress: string): void {
        logger.log('Spot TV left the MUC', { spotTvAddress });

        if (this._getBackend()) {
            // With backend it is okay for remote to sit in the MUC without Spot TV connected.
            if (!this._p2pSignaling?.getConnectionForAddress(spotTvAddress)?.isDataChannelActive()) {
                // If there's no active P2P channel then reset the TV state. This result in the waiting for Spot TV.
                this._resetSpotTvState();
            }

            // Do not retry when Spot TV is not in the MUC(unable to exchange offer/answer).
            if (this._spotTvP2PRetry) {
                this._spotTvP2PRetry.deactivate();
            }
        } else {
            this._onDisconnect(CONNECTION_EVENTS.SERVER_DISCONNECTED);
        }
    }

    /**
     * Called when Spot TV joins the MUC.
     *
     * @param spotTvAddress - The Spot TV address.
     * @private
     * @returns {void}
     */
    _onSpotTvJoinedMuc(spotTvAddress: string): void {
        logger.log('Spot TV joined the MUC', { spotTvAddress });

        // Client initiates the P2P signaling session
        if (this._spotTvP2PRetry) {
            this._spotTvP2PRetry.activate(spotTvAddress);
        }
    }

    /**
     * Spot TV status processing.
     *
     * @param from - Spot TV address from which the status has update has been received.
     * @param state - JSON object with TV's state.
     * @private
     * @returns {void}
     */
    _onSpotTvStatusReceived(from: string, state: any): void {
        const { msgId } = state;

        const previousMsgId = this._lastSpotState?.msgId;

        // Check if the status sent by the server was already processed.
        // The expected value of msgId is an incremental number, messages
        // are expected to be received in order so if the msgId is less than
        // the previous one it means the message was already processed.
        if (previousMsgId && (previousMsgId >= msgId)) {
            return;
        }

        // Redundantly update the known {@code RemoteControlServer} jid in case
        // there are multiple due to ghosts left form disconnect, in which case
        // the active {@code RemoteControlServer} should be emitting updates.
        this._lastSpotState = {
            ...state,
            spotId: from
        };

        // This is "no backend" specific logic
        if (this._waitForSpotTvTimeout) {
            clearTimeout(this._waitForSpotTvTimeout);
            this._waitForSpotTvTimeout = null;
        }

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
    _processMessage(messageType: string, from: string, data: any): void {
        switch (messageType) {
        case MESSAGES.JITSI_MEET_UPDATE:
            if (this._screenshareConnection) {
                this._screenshareConnection.processMessage({
                    data,
                    from
                });
            }
            break;
        default:
            super._processMessage(messageType, from, data);
            break;
        }
    }

    /**
     * Begins the process of creating a direct connection to the  Jitsi-Meet
     * participant.
     *
     * @param connection - Optionally use an existing
     * instance of ScreenshareConnection instead of instantiating one. This
     * would be used when creating a desktop track to stream first but the
     * actual connection to the Jitsi participant must occur later.
     * @param options - Additional configuration to use for creating
     * the screenshare connection.
     * @private
     * @returns {Promise}
     */
    _startWirelessScreenshare(connection?: any, options?: any): Promise<any> {
        if (this._screenshareConnection) {
            logger.error('Already started wireless screenshare');

            return Promise.reject('Already started wireless screenshare');
        }

        this._screenshareConnection
            = connection || this._createScreensharingService(options);

        return this._screenshareConnection.startScreenshare(this._getSpotId())
            .catch((error: any) => {
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
    _stopWirelessScreenshare(): Promise<any> {
        return this.setScreensharing(false);
    }
}

const remoteControlClient = new RemoteControlClient();

globalDebugger.register('remoteControlClient', remoteControlClient);

export default remoteControlClient;
