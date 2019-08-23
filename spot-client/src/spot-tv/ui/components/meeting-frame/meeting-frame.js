/* global JitsiMeetExternalAPI */

import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setSpotTVState } from 'common/app-state';
import { logger } from 'common/logger';
import { COMMANDS, MESSAGES, SERVICE_UPDATES } from 'common/remote-control';
import { parseMeetingUrl } from 'common/utils';

import { adjustVolume } from '../../../native-functions';

import { WiredScreenshareChangeListener } from '../wired-screenshare';

import { FeedbackHider } from './FeedbackHider';

const DEFAULT_DISPLAY_NAME = 'Meeting Room';

/**
 * The iFrame used to to display a Jitsi-Meet meeting.
 *
 * @extends React.Component
 */
export class MeetingFrame extends React.Component {
    static defaultProps = {
        displayName: DEFAULT_DISPLAY_NAME,

        /**
         * Ensure params set for the external api are defined or else a
         * harmless error message will logged by jitsi-meet.
         */
        preferredCamera: '',
        preferredMic: '',
        preferredSpeaker: '',
        screenshareDevice: ''
    };

    static propTypes = {
        avatarUrl: PropTypes.string,
        displayName: PropTypes.string,
        invites: PropTypes.array,
        jitsiAppName: PropTypes.string,
        jwt: PropTypes.string,
        maxDesktopSharingFramerate: PropTypes.number,
        meetingUrl: PropTypes.string,
        minDesktopSharingFramerate: PropTypes.number,
        onMeetingLeave: PropTypes.func,
        onMeetingStart: PropTypes.func,
        preferredCamera: PropTypes.string,
        preferredMic: PropTypes.string,
        preferredSpeaker: PropTypes.string,
        remoteControlServer: PropTypes.object,
        screenshareDevice: PropTypes.string,
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

        /**
         * The external api exposes toggle actions. Various states are stored
         * locally so any command can be compared to the cached state to prevent
         * calling a toggle action when the desired state has already been
         * achieved.
         */
        this._isAudioMuted = false;
        this._isFilmstripVisible = true;
        this._isInTileView = false;
        this._isScreensharing = false;
        this._isVideoMuted = false;

        this._participants = new Map();

        bindAll(this, [
            '_onAudioMuteChange',
            '_onFeedbackPromptDisplayed',
            '_onFilmstripDisplayChanged',
            '_onMeetingCommand',
            '_onMeetingJoined',
            '_onMeetingLeft',
            '_onMeetingLoaded',
            '_onParticipantJoined',
            '_onParticipantKicked',
            '_onParticipantLeft',
            '_onPasswordRequired',
            '_onReportDeviceError',
            '_onScreenshareChange',
            '_onScreenshareDeviceConnected',
            '_onScreenshareDeviceDisconnected',
            '_onSendMessageToRemoteControl',
            '_onTileViewChanged',
            '_onVideoMuteChange',
            '_setMeetingContainerRef'
        ]);

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
                desktopSharingFrameRate: {
                    max: this.props.maxDesktopSharingFramerate,
                    min: this.props.minDesktopSharingFramerate
                },
                disableDeepLinking: true,
                displayName: this.props.displayName,
                enableDisplayNameInStats: true,
                startScreenSharing: Boolean(this.props.screenshareDevice)
                    && this.props.startWithScreenshare,
                startWithVideoMuted: Boolean(this.props.startWithVideoMuted)
            },
            devices: {
                audioInput: this.props.preferredMic,
                audioOutput: this.props.preferredSpeaker,
                videoInput: this.props.preferredCamera
            },
            interfaceConfigOverwrite: {
                APP_NAME: this.props.jitsiAppName,
                AUTO_PIN_LATEST_SCREEN_SHARE: true,
                DEFAULT_LOCAL_DISPLAY_NAME: DEFAULT_DISPLAY_NAME,
                ENFORCE_NOTIFICATION_AUTO_DISMISS_TIMEOUT: 15000,
                TOOLBAR_BUTTONS: []
            },
            jwt: this.props.jwt,
            onload: this._onMeetingLoaded,
            parentNode: this._meetingContainer,
            roomName: meetingName
        });

        this._jitsiApi.addListener(
            'audioMuteStatusChanged', this._onAudioMuteChange);
        this._jitsiApi.addListener(
            'cameraError', this._onReportDeviceError);
        this._jitsiApi.addListener(
            'feedbackSubmitted', this.props.onMeetingLeave);
        this._jitsiApi.addListener(
            'feedbackPromptDisplayed', this._onFeedbackPromptDisplayed);
        this._jitsiApi.addListener(
            'filmstripDisplayChanged', this._onFilmstripDisplayChanged);
        this._jitsiApi.addListener(
            'micError', this._onReportDeviceError);
        this._jitsiApi.addListener(
            'participantJoined', this._onParticipantJoined);
        this._jitsiApi.addListener(
            'participantKickedOut', this._onParticipantKicked);
        this._jitsiApi.addListener(
            'participantLeft', this._onParticipantLeft);
        this._jitsiApi.addListener(
            'passwordRequired', this._onPasswordRequired);
        this._jitsiApi.addListener(
            'proxyConnectionEvent', this._onSendMessageToRemoteControl);
        this._jitsiApi.addListener(
            'readyToClose', this.props.onMeetingLeave);
        this._jitsiApi.addListener(
            'screenSharingStatusChanged', this._onScreenshareChange);
        this._jitsiApi.addListener(
            'tileViewChanged', this._onTileViewChanged);
        this._jitsiApi.addListener(
            'videoConferenceJoined', this._onMeetingJoined);
        this._jitsiApi.addListener(
            'videoConferenceLeft', this._onMeetingLeft);
        this._jitsiApi.addListener(
            'videoMuteStatusChanged', this._onVideoMuteChange);

        this._jitsiApi.executeCommand('avatarUrl', this.props.avatarUrl || '');
        this._jitsiApi.executeCommand(
            'displayName',
            this.props.displayName
        );

        this.props.remoteControlServer.addListener(
            SERVICE_UPDATES.CLIENT_MESSAGE_RECEIVED,
            this._onMeetingCommand
        );

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

        this.props.remoteControlServer.removeListener(
            SERVICE_UPDATES.CLIENT_MESSAGE_RECEIVED,
            this._onMeetingCommand
        );

        // TODO: create an action to reset the in-meeting state
        this.props.updateSpotTvState({
            audioMuted: false,
            inMeeting: '',
            kicked: false,
            needPassword: false,
            screensharingType: undefined,
            tileView: false,
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
                { this.state.feedbackDisplayed && <FeedbackHider /> }
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

        logger.error('error while loading meeting', {
            iFrameLoaded: this._meetingLoaded,
            meetingJoined: this._meetingJoined
        });

        this.props.onMeetingLeave({
            error: 'An error occurred while joining the meeting'
        });
    }

    /**
     * Hides the filmstrip if in a lonely call while screensharing.
     *
     * @private
     * @returns {void}
     */
    _maybeToggleFilmstripVisibility() {
        const shouldFilmstripBeVisible = !this._isScreensharing
            || this._participants.size > 0;

        if (shouldFilmstripBeVisible !== this._isFilmstripVisible) {
            this._jitsiApi.executeCommand('toggleFilmStrip');
        }
    }

    /**
     * Callback invoked after toggling audio mute from within the jitsi meeting.
     *
     * @param {Object} event - The mute event from JitsiMeetExternalAPI.
     * @private
     * @returns {void}
     */
    _onAudioMuteChange({ muted }) {
        logger.log('audio mute changed', {
            from: this._isAudioMuted,
            to: muted
        });

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
        case COMMANDS.ADJUST_VOLUME:
            adjustVolume(data.direction);
            break;

        case COMMANDS.HANG_UP:
            this._jitsiApi.executeCommand('hangup');

            if (data.skipFeedback) {
                this.props.onMeetingLeave();
            }

            break;

        case COMMANDS.SET_AUDIO_MUTE:
            if (this._isAudioMuted !== data.mute) {
                this._jitsiApi.executeCommand('toggleAudio');
            }
            break;

        case COMMANDS.SET_SCREENSHARING:
            if (this._isScreensharing !== data.on) {
                this._jitsiApi.executeCommand(
                    'toggleShareScreen',
                    { enable: data.on }
                );
            }
            break;

        case COMMANDS.SET_TILE_VIEW:
            if (this._isInTileView !== data.tileView) {
                this._jitsiApi.executeCommand('toggleTileView');
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

        case COMMANDS.SUBMIT_PASSWORD:
            this._jitsiApi.executeCommand('password', data);

            break;

        case MESSAGES.CLIENT_LEFT:
        case MESSAGES.CLIENT_PROXY_MESSAGE:
            this._jitsiApi.sendProxyConnectionEvent(data);
            break;
        }
    }

    /**
     * Sets the internal flag for the Jitsi-Meet meeting having successfully
     * been joined.
     *
     * @private
     * @returns {void}
     */
    _onMeetingJoined() {
        this._meetingJoined = true;

        this.props.onMeetingStart(this._jitsiApi);

        this.props.updateSpotTvState({
            inMeeting: this.props.meetingUrl,
            needPassword: false
        });

        if (this.props.invites && this.props.invites.length) {
            this._jitsiApi.invite(this.props.invites);
        }
    }

    /**
     * Informs Spot-Remotes the Spot-TV is no longer in a meeting.
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
     * Called when Jitsi-Meet displays the feedback prompt.
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
     * Updates the current known display state of the filmstrip, whether it is
     * displayed or hidden.
     *
     * @param {Object} event - The event returned from the external api about
     * the filmstrip change.
     * @param {boolean} visible - Whether or not the filmstrip strip is
     * currently set to be displayed all the time.
     * @private
     * @returns {void}
     */
    _onFilmstripDisplayChanged({ visible }) {
        this._isFilmstripVisible = visible;
    }

    /**
     * Adds a participant from the list of known current participants in the
     * meeting.
     *
     * @param {Object} event - An object with participant information.
     * @param {string} event.id - The jitsi-meet ID of the participant.
     * @param {string} even.displayName - The current name of the participant.
     * @private
     * @returns {void}
     */
    _onParticipantJoined({ id, displayName }) {
        this._participants.set(id, displayName);

        this._maybeToggleFilmstripVisibility();
    }

    /**
     * Callback invoked when the local participant has been removed from the
     * conference by another participant.
     *
     * @param {event} param0  - The event returned from the external api.
     * @param {Object} kicked - The participant that was kicked.
     * @private
     * @returns {void}
     */
    _onParticipantKicked({ kicked }) {
        if (kicked.local) {
            this.props.updateSpotTvState({
                kicked: true
            });
        }
    }

    /**
     * Removes a participant from the list of known current participants in the
     * meeting.
     *
     * @param {Object} event - An object with participant information.
     * @param {string} event.id - The jitsi-meet ID of the participant.
     * @private
     * @returns {void}
     */
    _onParticipantLeft({ id }) {
        this._participants.delete(id);

        this._maybeToggleFilmstripVisibility();
    }

    /**
     * Callback invoked when a meeting fails to join because it is locked.
     *
     * @private
     * @returns {void}
     */
    _onPasswordRequired() {
        logger.log('password required');

        clearTimeout(this._assumeMeetingFailedTimeout);

        this.props.updateSpotTvState({ needPassword: true });
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
     * Callback invoked when Jitsi-Meet failed to use a media device.
     *
     * @param {string} type - The type of the error.
     * @param {string} message - Additional information about the error.
     * @private
     * @returns {void}
     */
    _onReportDeviceError(type, message) {
        logger.error('device error occurred within the meeting', {
            type,
            message
        });
    }

    /**
     * Callback invoked after screensharing is enabled or disabled from within
     * the Jitsi-Meet meeting.
     *
     * @param {Object} event - The screensharing change event.
     * @private
     * @returns {void}
     */
    _onScreenshareChange({ on, details = {} }) {
        logger.log('meetingFrame screenshare changed', {
            details,
            on
        });

        // The api passes in null or true for the value
        this._isScreensharing = Boolean(on);

        this._maybeToggleFilmstripVisibility();

        this.props.updateSpotTvState({
            screensharingType: this._isScreensharing
                ? details.sourceType || 'other'
                : undefined
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
        // FIXME: There can be clashing with any wireless screensharing
        // handshake in progress.

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
        // FIXME: There can be clashing with the wireless screensharing being
        // turned off due to a device being disconnected.

        if (this._isScreensharing) {
            this._jitsiApi.executeCommand('toggleShareScreen');
        }
    }

    /**
     * Passes a message from {@code JitsiMeetExternalAPI} to a specified
     * instance of Spot-Remote.
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
        logger.log('got proxy message from iframe', {
            to,
            data
        });

        this.props.remoteControlServer.sendMessageToRemoteControl(to, data);
    }

    /**
     * Callback invoked after entering or exiting tile view layout mode.
     *
     * @param {Object} event - The tile view event from JitsiMeetExternalAPI.
     * @private
     * @returns {void}
     */
    _onTileViewChanged({ enabled }) {
        logger.log('Tile view changed', {
            from: this._isInTileView,
            to: enabled
        });

        this._isInTileView = enabled;

        this.props.updateSpotTvState({ tileView: enabled });
    }

    /**
     * Callback invoked after toggling video mute from within the jitsi meeting.
     *
     * @param {Object} event - The mute event from JitsiMeetExternalAPI.
     * @private
     * @returns {void}
     */
    _onVideoMuteChange({ muted }) {
        logger.log('Video mute changed', {
            from: this._isVideoMuted,
            to: muted
        });

        this._isVideoMuted = muted;

        this.props.updateSpotTvState({ videoMuted: muted });
    }

    /**
     * Sets the internal reference to the iFrame displaying the Jitsi-Meet meeting.
     *
     * @param {HTMLIFrameElement} ref - The iFrame displaying the Jitsi-Meet meeting.
     * @private
     * @returns {void}
     */
    _setMeetingContainerRef(ref) {
        this._meetingContainer = ref;
    }
}

/**
 * Creates actions which can update Redux state.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
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
