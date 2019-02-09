import { logger } from 'utils';

import { COMMANDS, MESSAGES } from './constants';
import ScreenshareService from './screenshare-connection';
import XmppConnection from './xmpp-connection';

/**
 * The interface for interacting with the XMPP service which powers the
 * communication between a Spot instance and remote control instances. Both the
 * Spot instance and remote controls join the same MUC and can get messages to
 * each other.
 */
class RemoteControlService {
    /**
     * Initializes a new {@code RemoteControlService} instance.
     */
    constructor() {
        this._delegate = null;

        this._onRemoteCommand = this._onRemoteCommand.bind(this);
        this._onRemoteMessage = this._onRemoteMessage.bind(this);
        this._onSpotStatusUpdate = this._onSpotStatusUpdate.bind(this);

        window.addEventListener('beforeunload', () => this.disconnect());
    }

    /**
     * Creates a connection to the remote control service.
     *
     * @param {Object} options - Information necessary for creating the MUC.
     * @param {boolean} options.joinAsSpot - Whether or not this connection is
     * being made by a Spot client.
     * @param {string} options.lock - The lock code to use when joining or
     * to set when creating a new MUC.
     * @param {string} options.roomName - The name of the MUC to join or create.
     * @param {Object} options.serverConfig - Details on how the XMPP connection
     * should be made.
     * @returns {Promise<string>}
     */
    connect({ joinAsSpot, lock, roomName, serverConfig }) {
        if (this.xmppConnectionPromise) {
            return this.xmppConnectionPromise;
        }

        this.xmppConnection = new XmppConnection({
            configuration: serverConfig,
            onRemoteCommand: this._onRemoteCommand,
            onRemoteMessage: this._onRemoteMessage,
            onSpotStatusUpdate: this._onSpotStatusUpdate
        });

        this.xmppConnectionPromise
            = this.xmppConnection.joinMuc(roomName, lock, joinAsSpot);

        return this.xmppConnectionPromise;
    }

    /**
     * Stops the XMPP connection.
     *
     * @returns {void}
     */
    disconnect() {
        if (this.xmppConnection) {
            this.xmppConnection.destroy();
            this.xmppConnection = null;
            this.xmppConnectionPromise = null;
        }
    }

    /**
     * Converts a join code to Spot instance information so it can be connected
     * to.
     *
     * @param {string} code - The join code to exchange for connection
     * information.
     * @returns {Promise<string>} Resolve with join information or an error.
     */
    exchangeCode(code = '') {
        return new Promise((resolve, reject) => {
            const enteredCode = code.trim();

            if (enteredCode.length === 6) {
                resolve(code.trim());
            } else {
                reject('Error with code.');
            }
        });
    }

    /**
     * Returns the current MUC that is joined to use as signaling between a Spot
     * and remote controls.
     *
     * @returns {string}
     */
    getRoomName() {
        const fullJid
            = this.xmppConnection && this.xmppConnection.getRoomFullJid();

        if (!fullJid) {
            return '';
        }

        return fullJid.split('@')[0];
    }

    /**
     * Requests a Spot to join a meeting.
     *
     * @param {string} meetingName - The meeting to join.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    goToMeeting(meetingName) {
        return this.xmppConnection.sendCommand(
            this._getSpotId(), COMMANDS.GO_TO_MEETING, { meetingName });
    }

    /**
     * Requests a Spot to leave a meeting in progress.
     *
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    hangUp() {
        return this.xmppConnection.sendCommand(
            this._getSpotId(), COMMANDS.HANG_UP);
    }

    /**
     * Notifies all controllers about a audio mute status change.
     *
     * @param {boolean} audioMuted - The currently audio mute status.
     * @returns {void}
     */
    notifyAudioMuteStatus(audioMuted) {
        this.xmppConnection.updateStatus('audioMuted', audioMuted);
    }

    /**
     * Notifies all controllers about a change in known calendar events.
     *
     * @param {Array<Object>} events - The calendar events for Spot.
     * @returns {void}
     */
    notifyCalendarStatus(events) {
        this.xmppConnection.updateStatus('calendar', events);
    }

    /**
     * Notifies all controllers of the current join code for Spot.
     *
     * @param {string} joinCode - The join code necessary for a user to connect
     * to Spot as a remote control.
     * @returns {void}
     */
    notifyJoinCodeUpdate(joinCode) {
        this.xmppConnection.updateStatus('joinCode', joinCode);
    }

    /**
     * Notifies all controllers about whether or not Spot is currently connected
     * to a meeting.
     *
     * @param {boolean} meetingUrl - The meeting url the Spot is currently in.
     * @returns {void}
     */
    notifyMeetingJoinStatus(meetingUrl) {
        this.xmppConnection.updateStatus('inMeeting', meetingUrl);
    }

    /**
     * Notifies all controllers about a screensharing status change.
     *
     * @param {boolean} screensharing - The current screensharing status.
     * @returns {void}
     */
    notifyScreenshareStatus(screensharing) {
        this.xmppConnection.updateStatus('screensharing', screensharing);
    }

    /**
     * Notifies all controllers about a video mute status change.
     *
     * @param {boolean} videoMuted - The current video mute status.
     * @returns {void}
     */
    notifyVideoMuteStatus(videoMuted) {
        this.xmppConnection.updateStatus('videoMuted', videoMuted);
    }

    /**
     * Notifies all controllers about the current view Spot is on.
     *
     * @param {string} viewName - The currently displayed view.
     * @returns {void}
     */
    notifyViewStatus(viewName) {
        if (this.xmppConnection) {
            this.xmppConnection.updateStatus('view', viewName);
        }
    }

    /**
     * Notifies all controllers the current availability of wired screensharing.
     *
     * @param {boolean} isEnabled - Whether or not screensharing is possible.
     * @returns {void}
     */
    notifyWiredScreenshareEnabled(isEnabled) {
        this.xmppConnection.updateStatus(
            'wiredScreensharingEnabled', isEnabled);
    }

    /**
     * Sends a message to a remote control.
     *
     * @param {string} jid - The jid of the remote control which should receive
     * the message.
     * @param {Object} data - Information to pass to the remote control.
     * @returns {Promise}
     */
    sendMessageToRemoteControl(jid, data) {
        return this.xmppConnection.sendMessage(
            jid, MESSAGES.JITSI_MEET_UPDATE, data);
    }

    /**
     * Requests a Spot to change its audio mute status.
     *
     * @param {boolean} mute - Whether or not Spot should be audio muted.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    setAudioMute(mute) {
        return this.xmppConnection.sendCommand(
            this._getSpotId(), COMMANDS.SET_AUDIO_MUTE, { mute });
    }

    /**
     * Stores a reference to a delegate for which hand over acting upon presence
     * updates and command iqs.
     *
     * @param {Object} delegate - An instance of {@code ProcessUpdateDelegate}.
     * @returns {void}
     */
    setDelegate(delegate) {
        this._delegate = delegate;
    }

    /**
     * Requests change the password on a joined room.
     *
     * @param {string} lock - The new password.
     * @returns {void}
     */
    setLock(lock) {
        this.xmppConnection.setLock(lock);
    }

    /**
     * Requests a Spot to change its screensharing status.
     *
     * @param {boolean} screensharing - Whether or not Spot should start or stop
     * screensharing.
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
     * Requests a Spot to change its video mute status.
     *
     * @param {boolean} mute - Whether or not Spot should be video muted.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    setVideoMute(mute) {
        return this.xmppConnection.sendCommand(
            this._getSpotId(), COMMANDS.SET_VIDEO_MUTE, { mute });
    }

    /**
     * Begins the process for establishing a connection to the meeting in order
     * to share a local screen to a remote spot.
     *
     * @param {boolean} enable - Whether to start ot stop screensharing.
     * @returns {Promise}
     */
    setWirelessScreensharing(enable) {
        if (enable) {
            const connection = new ScreenshareService({

                /**
                 * Callback invoked when the connection has been closed
                 * automatically. Triggers cleanup of
                 * {@code ScreenshareService}.
                 *
                 * @returns {void}
                 */
                onConnectionClosed: () => this._delegate.stopScreenshare(),

                /**
                 * Callback invoked by {@code ScreenshareService} in order to
                 * communicate out to a Spot.
                 *
                 * @param {string} to - The participant to send the message to.
                 * This is normally the Spot jid.
                 * @param {Object} data - A payload to send along with the
                 * message.
                 * @returns {Promise}
                 */
                sendMessage: (to, data) =>
                    this.xmppConnection.sendMessage(
                        to,
                        MESSAGES.REMOTE_CONTROL_UPDATE,
                        data
                    ).catch(error => logger.error(error))
            });

            return this._delegate.startScreenshare(
                this._getSpotId(),
                this.xmppConnection.getRoomFullJid(),
                connection
            );
        }

        this.setScreensharing(false);

        return this._delegate.stopScreenshare();
    }

    /**
     * Requests a Spot to change submit meeting feedback.
     *
     * @param {Object} feedback - The feedback to submit.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    submitFeedback(feedback) {
        return this.xmppConnection.sendCommand(
            this._getSpotId(), COMMANDS.SUBMIT_FEEDBACK, feedback);
    }

    /**
     * Gets the Spot for which to send commands.
     *
     * @private
     * @returns {string|null}
     */
    _getSpotId() {
        return this._delegate.getSpotId();
    }

    /**
     * Callback invoked when a command has been received.
     *
     * @param {Object} iq - The command iq.
     * @private
     * @returns {Promise}
     */
    _onRemoteCommand(iq) {
        if (!this._delegate) {
            return Promise.reject('No delegate set');
        }

        return this._delegate.onCommand(iq);
    }

    /**
     * Callback invoked when {@code XmppConnection} connection receives a
     * message iq that needs processing.
     *
     * @param {Object} iq - The XML document representing the iq with the
     * message.
     * @private
     * @returns {Promise}
     */
    _onRemoteMessage(iq) {
        if (!this._delegate) {
            return Promise.reject('No delegate set');
        }

        return this._delegate.onMessage(iq);
    }

    /**
     * Callback invoked when Spot has status update. Notifies registered
     * observers of the update.
     *
     * @param {Object} update - The status update.
     * @private
     * @returns {Promise}
     */
    _onSpotStatusUpdate(update) {
        return this._delegate.onStatus(update);
    }
}

export default new RemoteControlService();
