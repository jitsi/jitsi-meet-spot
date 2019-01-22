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

        this._onRemoteCommand = this._onRemoteCommand.bind(this);
        this._onSpotStatusUpdate = this._onSpotStatusUpdate.bind(this);

        window.addEventListener('beforeunload', () => this.disconnect());
    }

    /**
     * Creates a connection to the remote control service.
     *
     * @param {string} roomName - The name of the MUC to join. A MUC will be
     * created if a name is not provided.
     * @param {string} lock - The lock code needed to join an existing MUC.
     * @param {boolean} joinAsSpot -  Whether or not this connection is being
     * made by a Spot client.
     * @returns {Promise<string>}
     */
    connect(roomName, lock, joinAsSpot) {
        if (this.xmppConnectionPromise) {
            return this.xmppConnectionPromise;
        }

        this.xmppConnection = new XmppConnection({
            onRemoteCommand: this._onRemoteCommand,
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
    exchangeCode(code) {
        return new Promise((resolve, reject) => {
            if (code.length === 4) {
                resolve({});
            } else {
                reject('invalid code');
            }
        });
    }

    /**
     * Generates the full URL for opening a remote control for Spot.
     *
     * @returns {string}
     */
    getRemoteControlUrl() {
        const roomName = this.getRoomName();
        const lock = this.xmppConnection.getLock();

        return `${windowHandler.getBaseUrl()}#/remote-control?remoteId=${
            roomName}&lock=${lock}`;
    }

    /**
     * Returns the current MUC that is joined to use as signaling between a Spot
     * and remote controls.
     *
     * @returns {string}
     */
    getRoomName() {
        const fullJid = this.xmppConnection.getRoomFullJid();

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
     * Notifies all controllers about whether or not spot is currently connected
     * to a meeting.
     *
     * @param {boolean} isJoined - Whether or not Spot is in a meeting.
     * @returns {void}
     */
    notifyMeetingJoinStatus(isJoined) {
        this.xmppConnection.updateStatus('inMeeting', isJoined);
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
