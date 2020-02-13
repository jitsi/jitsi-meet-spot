import { Transport, PostMessageTransportBackend } from 'js-utils/transport';
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
     * @param {string} options.jwt - The JWT used to verify the Spot-TV instance
     * while interacting with integration services that provide information on
     * how to join Zoom meetings.
     * @param {string} options.meetingSignService - The url to call to encode
     * the meeting ID, per Zoom's requirements.
     * @param {HTMLElement} options.iframeTarget - The element to which to
     * append the iFrame which will display the Zoom meeting.
     * @param {Function} options.onMeetingUpdateReceived - The callback to invoke
     * when there is a meeting state update.
     */
    constructor(options) {
        this._options = options;

        this._transport = null;

        this._iframe = document.createElement('iframe');
        this._iframe.src = 'dist/zoom-meeting.html';
        this._iframe.classList.add('zoom-frame');

        this._options.iframeTarget.appendChild(this._iframe);

        this._transport = new Transport({
            backend: new PostMessageTransportBackend({
                postisOptions: {
                    scope: 'spot_zoom_integration',
                    window: this._iframe.contentWindow
                }
            })
        });

        this._transport.on('event', ({ type, data }) => {
            this._onMeetingUpdateReceived(type, data);

            return true;
        });
    }

    /**
     * Cleans up listeners to Zoom meeting updates, both those on the iframe
     * and those on this instance.
     *
     * @returns {void}
     */
    destroy() {
        this._iframe.remove();
        this._transport.dispose();
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
            jwt: this._options.jwt,
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
     * Sends a message with an expectation of a reply.
     *
     * @returns {Promise}
     */
    ping() {
        return this._transport.sendRequest({
            type: commands.PING
        });
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
     * Enters a password to be used to join a meeting.
     *
     * @param {string} password - The meeting password to use.
     * @returns {void}
     */
    submitPassword(password) {
        this._sendCommand(commands.SUBMIT_PASSWORD, { password });
    }

    /**
     * Callback invoked when the Zoom meeting sends a status update through
     * the iframe.
     *
     * @param {string} type - The constant representing the update.
     * @param {Object} data - Details about the update.
     * @private
     * @returns {void}
     */
    _onMeetingUpdateReceived(type, data) {
        this._options.onMeetingUpdateReceived(type, data);
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
        this._transport.sendEvent({
            type,
            data
        });
    }
}
