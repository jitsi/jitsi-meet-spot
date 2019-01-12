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
     * Requests a Spot to join a meeting.
     *
     * @param {string} meetingName - The meeting to join.
     * @param {string} to - The JID of the Spot.
     * @returns {void}
     */
    goToMeeting(meetingName, to) {
        this.xmppConnection.sendCommand(to, 'goToMeeting', { meetingName });
    }

    /**
     * Requests a Spot to leave a meeting in progress.
     *
     * @param {string} to - The JID of the Spot.
     * @returns {void}
     */
    hangUp(to) {
        this.xmppConnection.sendCommand(to, COMMANDS.HANG_UP);
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
     * @param {string} to - The jid of the Spot.
     * @returns {void}
     */
    requestCalendarEvents(to) {
        this.xmppConnection.sendCommand(to, 'requestCalendar');
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
     * @param {string} to - The JID of the Spot.
     * @param {Object} feedback - The feedback to submit.
     * @returns {void}
     */
    submitFeedback(to, feedback) {
        this.xmppConnection.sendCommand(to, COMMANDS.SUBMIT_FEEDBACK, feedback);
    }

    /**
     * Requests a Spot to change its audio mute status.
     *
     * @param {string} to - The JID of the Spot.
     * @returns {void}
     */
    toggleAudioMute(to) {
        this.xmppConnection.sendCommand(to, COMMANDS.TOGGLE_AUDIO_MUTE);
    }

    /**
     * Requests a Spot to change its screensharing status.
     *
     * @param {string} to - The JID of the Spot.
     * @returns {void}
     */
    toggleScreenshare(to) {
        this.xmppConnection.sendCommand(to, COMMANDS.TOGGLE_SCREENSHARE);
    }

    /**
     * Requests a Spot to change its video mute status.
     *
     * @param {string} to - The JID of the Spot.
     * @returns {void}
     */
    toggleVideoMute(to) {
        this.xmppConnection.sendCommand(to, COMMANDS.TOGGLE_VIDEO_MUTE);
    }

    /**
     * Callback invoked when Spot has status update. Notifies registered
     * observers of the update.
     *
     * @param {Object} status - The status update.
     * @private
     * @returns {void}
     */
    _onSpotStatusUpdate(status) {
        this._statusUpdateListeners.forEach(listener => listener(status));
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

    // Methods below to be removed.

    /**
     * The identifier for the local user in the MUC. Returns the full jid, which
     * has user@domain/resource.
     *
     * @returns {string}
     */
    getRoomFullJid() {
        return this.xmppConnection.getRoomFullJid();
    }
}

export default new RemoteControlService();
