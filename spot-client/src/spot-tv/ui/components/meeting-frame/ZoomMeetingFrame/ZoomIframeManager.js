import { commands } from 'common/zoom';

/**
 * Encapsulate setup, communication, and teardown of an iframe showing Zoom.
 */
export default class ZoomIframeManager {
    /**
     * Instantiates a new instance.
     *
     * @param {Object} options - Configuration for the new instance.
     * @param {string} options.apiKey - The Zoom client key to use for joining
     * meetings.
     * @param {string} options.meetingSignService - The url to call to encode
     * the meeting ID, per Zoom's requirements.
     * @param {HTMLElement} options.iframeTarget - The element to which to
     * append the iFrame which will display the Zoom meeting.
     * @param {Function} options.onMeetingUpdateReceived - The callback to invoke
     * when there is a meeting state update.
     */
    constructor(options) {
        this._options = options;

        this._iframe = null;

        this._onMeetingUpdateReceived = this._onMeetingUpdateReceived.bind(this);

        window.addEventListener('message', this._onMeetingUpdateReceived);
    }

    /**
     * Cleans up listeners to Zoom meeting updates, both those on the iframe
     * and those on this instance.
     *
     * @returns {void}
     */
    destroy() {
        if (this._iframe) {
            this._iframe.remove();
        }

        window.removeEventListener('message', this._onMeetingUpdateReceived);
    }

    /**
     * Attempts to join a Zoom meeting.
     *
     * @param {string} meetingNumber - The Zoom meeting number (meeting name).
     * @param {string} passWord - The password needed to enter the Zoom meeting.
     * @param {string} userName - The display name for the local participant.
     * @returns {void}
     */
    goToMeeting(meetingNumber, passWord, userName) {
        this._sendCommand(commands.JOIN, {
            apiKey: this._options.apiKey,
            userName,
            passWord,
            meetingNumber,
            meetingSignService: this._options.meetingSignService
        });
    }

    /**
     * Leaves the meeting.
     *
     * @returns {void}
     */
    hangUp() {
        this._sendCommand(commands.HANG_UP);
    }

    /**
     * Instantiates iframe to display of the Zoom meeting.
     *
     * @private
     * @returns {void}
     */
    load() {
        if (this._iframe) {
            return;
        }

        this._iframe = document.createElement('iframe');
        this._iframe.src = 'dist/zoom-meeting.html';
        this._iframe.classList.add('zoom-frame');

        this._options.iframeTarget.appendChild(this._iframe);
    }

    /**
     * Sets audio mute to the desired state.
     *
     * @param {boolean} mute - Whether audio should be set to muted or not muted.
     * @returns {void}
     */
    setAudioMute(mute) {
        this._sendCommand(commands.AUDIO_MUTE, { mute });
    }

    /**
     * Sets video mute to the desired state.
     *
     * @param {boolean} mute - Whether video should be set to muted or not muted.
     * @returns {void}
     */
    setVideoMute(mute) {
        this._sendCommand(commands.VIDEO_MUTE, { mute });
    }

    /**
     * Callback invoked when the Zoom meeting sends a status update through
     * the iframe.
     *
     * @param {Object} update - Information about a status change in the meeting.
     * @param {string} update.origin - The host of the parent window. Only
     * commands from a matching host are respected.
     * @param {Object} update.data - The status update itself.
     * @param {string} update.data.type - The constant representing the update.
     * @param {Object} update.data.data - Details about the update.
     * @private
     * @returns {void}
     */
    _onMeetingUpdateReceived({ origin, data }) {
        if (origin !== window.location.origin) {
            return;
        }

        this._options.onMeetingUpdateReceived(data.type, data.data);
    }

    /**
     * Sends a command to the Zoom meeting.
     *
     * @param {string} type - The constant representing the command.
     * @param {Object} data - Information about how to execute the command.
     * @private
     * @returns {void}
     */
    _sendCommand(type, data) {
        this._iframe.contentWindow.postMessage({
            type,
            data
        });
    }
}
