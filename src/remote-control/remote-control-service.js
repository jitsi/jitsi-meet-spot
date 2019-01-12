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
        this._spotId = null;

        this._commandListeners = new Set();
        this._statusUpdateListeners = new Set();

        this._onRemoteCommand = this._onRemoteCommand.bind(this);
        this._onSpotStatusUpdate = this._onSpotStatusUpdate.bind(this);
    }

    /**
     * Add an observers which should be notified when a command is received
     * through the muc.
     *
     * @param {Function} listener - The callback to invoke when a command is
     * received from a remote.
     * @returns {void}
     */
    addRemoteCommandListener(listener) {
        this._commandListeners.add(listener);
    }

    /**
     * Subscribes an observers for status updates from other participants in the
     * muc.
     *
     * @param {Function} listener - The callback which should be invoked when
     * another participant has updated its presence.
     * @returns {void}
     */
    addSpotStatusListener(listener) {
        this._statusUpdateListeners.add(listener);
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
     * @returns {void}
     */
    goToMeeting(meetingName) {
        this.xmppConnection.sendCommand(
            this._spotId, 'goToMeeting', { meetingName });
    }

    /**
     * Requests a Spot to leave a meeting in progress.
     *
     * @returns {void}
     */
    hangUp() {
        this.xmppConnection.sendCommand(this._spotId, COMMANDS.HANG_UP);
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
     * Notifies a controller about the latest calendar data.
     *
     * @param {string} to - The controller to notify.
     * @param {Object} data - The calendar events.
     * @returns {void}
     */
    notifyCalendarEvents(to, data) {
        this.xmppConnection.sendCommand(
            to,
            'calendarData',
            data
        );
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
     * Requests Spot to send out its latest calendar events.
     *
     * @returns {void}
     */
    requestCalendarEvents() {
        this.xmppConnection.sendCommand(this._spotId, 'requestCalendar');
    }

    /**
     * Unsubscribes an observer from commands received through XMPP channels.
     *
     * @param {Function} listener - The observer to unsubscribe.
     * @returns {void}
     */
    removeRemoteCommandListener(listener) {
        this._commandListeners.delete(listener);
    }

    /**
     * Unsubscribes an observer from status updates from other participants in
     * the muc.
     *
     * @param {Function} listener - The listener to be removed.
     * @returns {void}
     */
    removeSpotStatusListener(listener) {
        this._statusListeners.delete(listener);
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
     * Requests a Spot to change submit meeting feedback.
     *
     * @param {Object} feedback - The feedback to submit.
     * @returns {void}
     */
    submitFeedback(feedback) {
        this.xmppConnection.sendCommand(
            this._spotId, COMMANDS.SUBMIT_FEEDBACK, feedback);
    }

    /**
     * Requests a Spot to change its audio mute status.
     *
     * @returns {void}
     */
    toggleAudioMute() {
        this.xmppConnection.sendCommand(
            this._spotId, COMMANDS.TOGGLE_AUDIO_MUTE);
    }

    /**
     * Requests a Spot to change its screensharing status.
     *
     * @returns {void}
     */
    toggleScreenshare() {
        this.xmppConnection.sendCommand(
            this._spotId, COMMANDS.TOGGLE_SCREENSHARE);
    }

    /**
     * Requests a Spot to change its video mute status.
     *
     * @returns {void}
     */
    toggleVideoMute() {
        this.xmppConnection.sendCommand(
            this._spotId, COMMANDS.TOGGLE_VIDEO_MUTE);
    }

    /**
     * Callback invoked when Spot has status update. Notifies registered
     * observers of the update.
     *
     * @param {Object} update - The status update.
     * @private
     * @returns {void}
     */
    _onSpotStatusUpdate(update) {
        if (update.status.isSpot === 'true') {
            this._spotId = update.from.split('/')[1];
            this._statusUpdateListeners.forEach(listener => listener(update));
        }
    }

    /**
     * Callback invoked when a command has been received.
     *
     * @param {string} type - The constant for the command.
     * @param {string} from - The JID of the sender of the command.
     * @param {Object} data - Additional details for fulfilling the command.
     * @private
     * @returns {void}
     */
    _onRemoteCommand(type, from, data) {
        this._commandListeners.forEach(listener => listener(type, from, data));
    }
}

export default new RemoteControlService();
