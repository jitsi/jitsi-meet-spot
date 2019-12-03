import { commands, events } from 'common/zoom';
import { sdk } from './../sdk';

/**
 * Encapsulates logic for sending and receiving messages from the parent window.
 */
export class IFrameApi {
    /**
     * Initializes a new instance.
     *
     * @param {Object} globalWindow - The window object associated with the
     * page.
     */
    constructor(globalWindow) {
        this.parent = globalWindow.parent;
        this.acceptedOrigin = globalWindow.location.origin;

        this._onMessageFromParent = this._onMessageFromParent.bind(this);
        this._onMeetingStatusChange = this._onMeetingStatusChange.bind(this);

        globalWindow.addEventListener('message', this._onMessageFromParent);

        globalWindow.addEventListener(
            'beforeunload', () => this._sendMessageToParent(events.MEETING_ENDED));

        sdk.initialize(this._onMeetingStatusChange)
            .then(() => this._sendMessageToParent(events.READY));
    }

    /**
     * Callback invoked when a message is received from the parent window with
     * a command to take an action in the meeting.
     *
     * @param {Object} command - Information about the action to take.
     * @param {string} command.origin - The host of the parent window. Only
     * commands from a matching host are respected.
     * @param {Object} command.data - The command itself.
     * @param {string} command.data.type - The constant representing the command.
     * @param {Object} command.data.data - Information about how to execute
     * the command.
     * @private
     * @returns {void}
     */
    _onMessageFromParent({ origin, data }) {
        if (origin !== this.acceptedOrigin) {
            return;
        }

        switch (data.type) {
        case commands.AUDIO_MUTE: {
            sdk.setAudioMute(data.data.mute);
            break;
        }

        case commands.HANG_UP: {
            sdk.hangUp();
            break;
        }

        case commands.JOIN: {
            sdk.joinMeeting(data.data)
                .then(
                    () => this._sendMessageToParent(events.MEETING_JOIN_SUCCEEDED),
                    error => this._sendMessageToParent(events.MEETING_JOIN_FAILED, { error })
                );

            break;
        }
        case commands.VIDEO_MUTE: {
            sdk.setVideoMute(data.data.mute);
            break;
        }
        }
    }

    /**
     * Callback invoked when the meeting has an updated state. The updated
     * state is relayed to the iframe parent.
     *
     * @param {string} type - The constant representing the status update.
     * @param {Object} data - Additional information describing the update.
     * @private
     * @returns {void}
     */
    _onMeetingStatusChange(type, data) {
        this._sendMessageToParent(type, data);
    }

    /**
     * Sends a message to the host of the iframe.
     *
     * @param {string} type - The constant representing the message to send.
     * @param {Object} data - Additional information to send along with the
     * message.
     * @returns {void}
     */
    _sendMessageToParent(type, data = {}) {
        this.parent.postMessage({
            data,
            type
        }, this.targetOrigin);
    }
}

export default new IFrameApi(window);
