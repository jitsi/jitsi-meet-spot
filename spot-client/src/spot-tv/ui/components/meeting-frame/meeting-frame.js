/* global JitsiMeetExternalAPI */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setSpotTVState } from 'common/app-state';
import { logger } from 'common/logger';
import { COMMANDS, MESSAGES } from 'common/remote-control';
import { parseMeetingUrl } from 'common/utils';

import { WiredScreenshareChangeListener } from '../wired-screenshare';

/**
 * The iFrame used to to display a meeting hosted on a jitsi instance.
 *
 * @extends React.Component
 */
export class MeetingFrame extends React.Component {
    static defaultProps = {
        displayName: 'Meeting Room'
    };

    static propTypes = {
        displayName: PropTypes.string,
        invites: PropTypes.array,
        meetingUrl: PropTypes.string,
        onMeetingLeave: PropTypes.func,
        onMeetingStart: PropTypes.func,
        remoteControlService: PropTypes.object,
        screenshareDevice: PropTypes.string,
        showMeetingToolbar: PropTypes.bool,
        startWithScreenshare: PropTypes.bool,
        startWithVideoMuted: PropTypes.bool,
        updateSpotTvState: PropTypes.func
    };

    /**
     * Initializes a new {@code MeetingFrame} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._isAudioMuted = null;
        this._isScreensharing = null;
        this._isVideoMuted = null;

        this._onAudioMuteChange = this._onAudioMuteChange.bind(this);
        this._onFeedbackPromptDisplayed
            = this._onFeedbackPromptDisplayed.bind(this);
        this._onMeetingCommand = this._onMeetingCommand.bind(this);
        this._onMeetingJoined = this._onMeetingJoined.bind(this);
        this._onMeetingLeft = this._onMeetingLeft.bind(this);
        this._onMeetingLoaded = this._onMeetingLoaded.bind(this);
        this._onScreenshareChange = this._onScreenshareChange.bind(this);
        this._onScreenshareDeviceConnected
            = this._onScreenshareDeviceConnected.bind(this);
        this._onScreenshareDeviceDisconnected
            = this._onScreenshareDeviceDisconnected.bind(this);
        this._onSendMessageToRemoteControl
            = this._onSendMessageToRemoteControl.bind(this);
        this._onVideoMuteChange = this._onVideoMuteChange.bind(this);
        this._setMeetingContainerRef = this._setMeetingContainerRef.bind(this);

        this._jitsiApi = null;
        this._meetingContainer = null;
        this._meetingLoaded = false;
        this._meetingJoined = false;
        this.state = {
            feedbackDisplayed: false
        };
    }

    /**
     * Initializes a new instance of the jitsi iframe api and sets status update
     * listeners onto it.
     *
     * @inheritdoc
     */
    componentDidMount() {
        const {
            host,
            meetingName,
            path
        } = parseMeetingUrl(this.props.meetingUrl);

        this._jitsiApi = new JitsiMeetExternalAPI(`${host}${path}`, {
            configOverwrite: {
                _desktopSharingSourceDevice: this.props.screenshareDevice,
                startScreenSharing: Boolean(this.props.screenshareDevice)
                    && this.props.startWithScreenshare,
                startWithVideoMuted: Boolean(this.props.startWithVideoMuted)
            },
            interfaceConfigOverwrite: {
                DEFAULT_LOCAL_DISPLAY_NAME: '',
                TOOLBAR_BUTTONS: this.props.showMeetingToolbar ? undefined : []
            },
            onload: this._onMeetingLoaded,
            parentNode: this._meetingContainer,
            roomName: meetingName
        });

        this._jitsiApi.addListener(
            'audioMuteStatusChanged', this._onAudioMuteChange);
        this._jitsiApi.addListener(
            'feedbackSubmitted', this.props.onMeetingLeave);
        this._jitsiApi.addListener(
            'feedbackPromptDisplayed', this._onFeedbackPromptDisplayed);
        this._jitsiApi.addListener(
            'proxyConnectionEvent', this._onSendMessageToRemoteControl);
        this._jitsiApi.addListener(
            'readyToClose', this.props.onMeetingLeave);
        this._jitsiApi.addListener(
            'screenSharingStatusChanged', this._onScreenshareChange);
        this._jitsiApi.addListener(
            'videoConferenceJoined', this._onMeetingJoined);
        this._jitsiApi.addListener(
            'videoConferenceLeft', this._onMeetingLeft);
        this._jitsiApi.addListener(
            'videoMuteStatusChanged', this._onVideoMuteChange);

        this._jitsiApi.executeCommand('displayName', this.props.displayName);

        this.props.remoteControlService.startListeningForRemoteMessages(
            this._onMeetingCommand);

        this._assumeMeetingFailedTimeout = setTimeout(() => {
            this._leaveIfErrorDetected();
        }, 15000);
    }

    /**
     * Removes listeners connected to external services.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        clearTimeout(this._assumeMeetingFailedTimeout);

        this.props.remoteControlService.stopListeningForRemoteMessages(
            this._onMeetingCommand);

        this.props.updateSpotTvState({
            audioMuted: false,
            screensharing: false,
            videoMuted: false
        });
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <>
                { this.state.feedbackDisplayed && this._renderFeedbackHider() }
                <WiredScreenshareChangeListener
                    onDeviceConnected
                        = { this._onScreenshareDeviceConnected }
                    onDeviceDisconnected
                        = { this._onScreenshareDeviceDisconnected } />
                <div
                    className = 'meeting-frame'
                    ref = { this._setMeetingContainerRef } />
            </>
        );
    }

    /**
     * Check if the iFrame has encountered any errors while loading the meeting
     * and trigger meeting leave if one has been detected.
     *
     * @private
     * @returns {void}
     */
    _leaveIfErrorDetected() {
        // TODO: implement smarter detection of iframe errors. Currently there
        // is no hook within the jitsi iframe api to know if the meeting
        // encountered an error. There may also be no definitive way to know if
        // the user has proceeded to an erroneous, non-meeting page or if a page
        // failed to load (404).
        if (this._meetingLoaded && this._meetingJoined) {
            return;
        }

        logger.error(
            `meetingFrame error while loading meeting, iframe loaded ${
                this._meetingLoaded} joined ${this._meetingJoined}`
        );

        this.props.onMeetingLeave({
            error: 'An error occurred while joining the meeting'
        });
    }

    /**
     * Callback invoked after toggling audio mute from within the jitsi meeting.
     *
     * @param {Object} event - The mute event from JitsiMeetExternalAPI.
     * @private
     * @returns {void}
     */
    _onAudioMuteChange({ muted }) {
        logger.log(`meetingFrame audio mute changed from ${
            this._isVideoMuted} to ${muted}`);

        this._isAudioMuted = muted;

        this.props.updateSpotTvState({ audioMuted: muted });
    }


    /**
     * Callback invoked when a Spot-Remote has sent this Spot-TV a message or
     * command that should be acted upon while in a meeting.
     *
     * @param {string} type - The identifier for the command or message.
     * @param {Object} data - Additional information necessary to process the
     * command or message.
     * @private
     * @returns {void}
     */
    _onMeetingCommand(type, data) {
        logger.log('MeetingFrame handling remote command', {
            data,
            type
        });

        switch (type) {
        case COMMANDS.HANG_UP:
            this._jitsiApi.executeCommand('hangup');
            break;

        case COMMANDS.SET_AUDIO_MUTE:
            if (this._isAudioMuted !== data.mute) {
                this._jitsiApi.executeCommand('toggleAudio');
            }
            break;

        case COMMANDS.SET_SCREENSHARING:
            if (this._isScreensharing !== data.on) {
                this._jitsiApi.executeCommand('toggleShareScreen');
            }
            break;

        case COMMANDS.SET_VIDEO_MUTE:
            if (this._isVideoMuted !== data.mute) {
                this._jitsiApi.executeCommand('toggleVideo');
            }
            break;

        case COMMANDS.SUBMIT_FEEDBACK:
            this._jitsiApi.executeCommand('submitFeedback', data);
            break;

        case MESSAGES.SPOT_REMOTE_LEFT:
        case MESSAGES.SPOT_REMOTE_PROXY_MESSAGE:
            this._jitsiApi.sendProxyConnectionEvent(data);
            break;
        }
    }

    /**
     * Sets the internal flag for the jitsi meeting having successfully been
     * joined.
     *
     * @private
     * @returns {void}
     */
    _onMeetingJoined() {
        this._meetingJoined = true;

        this.props.onMeetingStart(this._jitsiApi);

        this.props.updateSpotTvState({
            inMeeting: this.props.meetingUrl
        });

        if (this.props.invites && this.props.invites.length) {
            this._jitsiApi.invite(this.props.invites);
        }
    }

    /**
     * Updates the known status of Spot to remote controllers.
     *
     * @private
     * @returns {void}
     */
    _onMeetingLeft() {
        logger.log('meetingFrame meeting left');

        this.props.updateSpotTvState({
            inMeeting: ''
        });
    }

    /**
     * Called when Jitsi Meet displays the feedback prompt.
     *
     * @private
     * @returns {void}
     */
    _onFeedbackPromptDisplayed() {
        logger.log('feedback prompt displayed');

        this.setState({
            feedbackDisplayed: true
        });

        this.props.updateSpotTvState({
            view: 'feedback'
        });
    }

    /**
     * Sets the internal flag for the jitsi iframe api having loaded the page.
     * This event fires no matter the state of the page load, for example on
     * 404.
     *
     * @private
     * @returns {void}
     */
    _onMeetingLoaded() {
        this._meetingLoaded = true;
        this.setState({
            feedbackDisplayed: false
        });
    }

    /**
     * Callback invoked after screensharing is enabled or disabled within the
     * jitsi meeting.
     *
     * @param {Object} event - The screensharing change event.
     * @private
     * @returns {void}
     */
    _onScreenshareChange({ on }) {
        logger.log(`meetingFrame screenshare changed from ${
            this._isScreensharing} to ${on}`);

        this._isScreensharing = on;

        this.props.updateSpotTvState({
            screensharing: on
        });
    }

    /**
     * Callback invoked to start screensharing if a screenshare device has
     * recently been connected to the Spot-TV.
     *
     * @private
     * @returns {void}
     */
    _onScreenshareDeviceConnected() {
        // FIXME: There can be clashing with the wireless screensharing.

        if (!this._isScreensharing) {
            this._jitsiApi.executeCommand('toggleShareScreen');
        }
    }

    /**
     * Callback invoked to start screensharing if a screenshare device has
     * recently been disconnected to the Spot-TV.
     *
     * @private
     * @returns {void}
     */
    _onScreenshareDeviceDisconnected() {
        // FIXME: There can be clashing with the wireless screensharing.

        if (this._isScreensharing) {
            this._jitsiApi.executeCommand('toggleShareScreen');
        }
    }

    /**
     * Passes a message from {@code JitsiMeetExternalAPI} to a specified
     * remote control.
     *
     * @param {Object} event - The object holding information on what and how to
     * send the message.
     * @param {string} event.to - The jid of the remote control which should
     * receive the message.
     * @param {Object} event.data - Details of the message.
     * @private
     * @returns {void}
     */
    _onSendMessageToRemoteControl({ to, data }) {
        logger.log('meetingFrame got proxy message from iframe', {
            to,
            data
        });

        this.props.remoteControlService.sendMessageToRemoteControl(to, data);
    }

    /**
     * Callback invoked after toggling video mute from within the jitsi meeting.
     *
     * @param {Object} event - The mute event from JitsiMeetExternalAPI.
     * @private
     * @returns {void}
     */
    _onVideoMuteChange({ muted }) {
        logger.log(`meetingFrame video mute changed from ${
            this._isVideoMuted} to ${muted}`);

        this._isVideoMuted = muted;

        this.props.updateSpotTvState({ videoMuted: muted });
    }

    /**
     * Renders a text overlay which hides Jitsi Meet iFrame when it's asking for feedback.
     *
     * @returns {ReactNode}
     * @private
     */
    _renderFeedbackHider() {
        return (
            <div className = 'feedback-hider-overlay'>
                <div className = 'feedback-hider-text-frame'>
                    <h1>Thanks for using Spot!</h1>
                    <div className = 'feedback-hider-text'>
                        <div>You can use the remote control device to submit feedback now.</div>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Sets the internal reference to the iFrame element displaying the jitsi
     * meeting.
     *
     * @param {HTMLIFrameElement} ref - The HTMLIFrameElement displaying the
     * jitsi meeting.
     * @private
     * @returns {void}
     */
    _setMeetingContainerRef(ref) {
        this._meetingContainer = ref;
    }
}

/**
 * Creates actions which can update Redux state..
 *
 * @param {Object} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        updateSpotTvState(newState) {
            dispatch(setSpotTVState(newState));
        }
    };
}

export default connect(undefined, mapDispatchToProps)(MeetingFrame);
