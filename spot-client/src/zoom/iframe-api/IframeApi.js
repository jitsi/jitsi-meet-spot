import { Transport, PostMessageTransportBackend } from 'js-utils/transport';
import { commands, events } from 'common/zoom';
import { Sdk as ZoomSdk } from './../sdk';

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
        this._onMeetingStatusChange = this._onMeetingStatusChange.bind(this);

        globalWindow.addEventListener(
            'beforeunload', () => this._sendMessageToParent(events.MEETING_ENDED));

        this._onMeetingStatusChange = this._onMeetingStatusChange.bind(this);

        this._transport = new Transport({
            backend: new PostMessageTransportBackend({
                postisOptions: {
                    scope: 'spot_zoom_integration'
                }
            })
        });

        ZoomSdk.loadDependencies()
            .then(() => {
                this._zoomSdk = new ZoomSdk(this._onMeetingStatusChange);

                this._transport.on('event', ({ type, data }) => {
                    this._onMessageFromParent(type, data);

                    return true;
                });

                this._transport.on('request', (request, callback) => {
                    this._onRequestFromParent(request.type, callback);

                    return true;
                });

                this._sendMessageToParent(events.READY);
            });
    }

    /**
     * Callback invoked when a message is received from the parent window with
     * a command to take an action in the meeting.
     *
     * @param {string} type - The constant representing the command.
     * @param {Object} data - Information about how to execute
     * the command.
     * @private
     * @returns {void}
     */
    _onMessageFromParent(type, data) {
        switch (type) {
        case commands.AUDIO_MUTE: {
            this._zoomSdk.setAudioMute(data.mute);
            break;
        }

        case commands.HANG_UP: {
            this._zoomSdk.hangUp();
            break;
        }

        case commands.JOIN: {
            this._zoomSdk.joinMeeting(data)
                .then(
                    () => this._sendMessageToParent(events.MEETING_JOIN_SUCCEEDED),
                    error => this._sendMessageToParent(events.MEETING_JOIN_FAILED, { error })
                );

            break;
        }

        case commands.SUBMIT_PASSWORD: {
            this._zoomSdk.submitPassword(data.password)
                .then(
                    () => this._sendMessageToParent(events.MEETING_JOIN_SUCCEEDED),
                    error => this._sendMessageToParent(events.MEETING_JOIN_FAILED, { error })
                );
            break;
        }

        case commands.VIDEO_MUTE: {
            this._zoomSdk.setVideoMute(data.mute);
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
    _onMeetingStatusChange(type, data = {}) {
        this._sendMessageToParent(type, data);
    }


    /**
     * Callback invoked when a message is received from the parent window with
     * an expectation of a reply.
     *
     * @param {string} type - The constant representing the request.
     * @param {Function} callback - The callback to invoke with information
     * about the executed request.
     * @private
     * @returns {void}
     */
    _onRequestFromParent(type, callback) {
        switch (type) {
        case commands.PING:
            callback('pong');
            break;
        }

        return true;
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
        // Special case for Error as it  doesn't convert to JSON auto magically
        if (data.error && (data.error.message || data.error.stack)) {
            this._transport.sendEvent({
                type,
                data: {
                    error: {
                        message: data.error.message,
                        stack: data.error.stack
                    }
                }
            });
        }

        this._transport.sendEvent({
            type,
            data
        });
    }
}

export default new IFrameApi(window);
