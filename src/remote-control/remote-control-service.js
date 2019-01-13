import { windowHandler } from 'utils';
import { COMMANDS } from './constants';
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
        this._spotId = null;

        this._onRemoteCommand = this._onRemoteCommand.bind(this);
        this._onSpotStatusUpdate = this._onSpotStatusUpdate.bind(this);
    }

    /**
     * Creates a connection to the remote control service.
     *
     * @param {string} roomName - The name of the MUC to join. A MUC will be
     * created if a name is not provided.
     * @param {string} lock - The lock code needed to join an existing MUC.
     * @returns {Promise<string>}
     */
    connect(roomName, lock) {
        if (this.xmppConnectionPromise) {
            return this.xmppConnectionPromise;
        }

        this.xmppConnection = new XmppConnection({
            onRemoteCommand: this._onRemoteCommand,
            onSpotStatusUpdate: this._onSpotStatusUpdate
        });

        this.xmppConnectionPromise
            = this.xmppConnection.joinMuc(roomName, lock);

        return this.xmppConnectionPromise;
    }

    /**
     * Generates the full URL for opening a remote control for Spot.
     *
     * @returns {string}
     */
    getRemoteControlUrl() {
        const fullJid = this.xmppConnection.getRoomFullJid();

        if (!fullJid) {
            return '';
        }

        const lock = this.xmppConnection.getLock();

        return `${windowHandler.getBaseUrl()}#/remote-control/${
            window.encodeURIComponent(fullJid)}?lock=${lock}`;
    }

    /**
     * Requests a Spot to join a meeting.
     *
     * @param {string} meetingName - The meeting to join.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    goToMeeting(meetingName) {
        return this.xmppConnection.sendCommand(
            this._spotId, COMMANDS.GO_TO_MEETING, { meetingName });
    }

    /**
     * Requests a Spot to leave a meeting in progress.
     *
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    hangUp() {
        return this.xmppConnection.sendCommand(
            this._spotId, COMMANDS.HANG_UP);
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
        this.xmppConnection.updateStatus('view', viewName);
    }

    /**
     * Requests Spot to send out its latest calendar events.
     *
     * @returns {Promise} Resolves with calendar data.
     */
    requestCalendarEvents() {
        return this.xmppConnection.sendCommand(
            this._spotId, COMMANDS.REQUEST_CALENDAR);
    }

    /**
     * Requests a Spot to change its audio mute status.
     *
     * @param {boolean} mute - Whether or not Spot should be audio muted.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    setAudioMute(mute) {
        return this.xmppConnection.sendCommand(
            this._spotId, COMMANDS.SET_AUDIO_MUTE, { mute });
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
            this._spotId, COMMANDS.SET_SCREENSHARING, { on: screensharing });
    }

    /**
     * Requests a Spot to change its video mute status.
     *
     * @param {boolean} mute - Whether or not Spot should be video muted.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    setVideoMute(mute) {
        return this.xmppConnection.sendCommand(
            this._spotId, COMMANDS.SET_VIDEO_MUTE, { mute });
    }

    /**
     * Requests a Spot to change submit meeting feedback.
     *
     * @param {Object} feedback - The feedback to submit.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    submitFeedback(feedback) {
        return this.xmppConnection.sendCommand(
            this._spotId, COMMANDS.SUBMIT_FEEDBACK, feedback);
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
     * Callback invoked when Spot has status update. Notifies registered
     * observers of the update.
     *
     * @param {Object} update - The status update.
     * @private
     * @returns {Promise}
     */
    _onSpotStatusUpdate(update) {
        if (update.status.isSpot === 'true') {
            this._spotId = update.from;

            if (!this._delegate) {
                return Promise.reject('No delegate set');
            }

            return this._delegate.onStatus(update);
        }
    }
}

export default new RemoteControlService();
