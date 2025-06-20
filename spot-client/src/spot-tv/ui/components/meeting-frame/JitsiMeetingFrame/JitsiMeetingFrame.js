/* global JitsiMeetExternalAPI */

import {
    getClientAspectRatio,
    getFilmStripAspectRatioSplit,
    getFilmStripThresholdWidth,
    setSpotTVState
} from 'common/app-state';
import { logger } from 'common/logger';
import { COMMANDS, MESSAGES } from 'common/remote-control';
import { getVideoSettings, parseMeetingUrl } from 'common/utils';
import bindAll from 'lodash.bindall';
import React from 'react';
import { connect } from 'react-redux';

import { nativeCommands } from '../../../../native-functions';
import { WiredScreenshareChangeListener } from '../../wired-screenshare';
import AbstractMeetingFrame from '../AbstractMeetingFrame';
import MeetingType from '../MeetingType';

import FeedbackHider from './FeedbackHider';

const DEFAULT_DISPLAY_NAME = 'Meeting Room';

/**
 * The iFrame used to to display a Jitsi-Meet meeting.
 */
export class JitsiMeetingFrame extends AbstractMeetingFrame {
    static defaultProps = {
        displayName: DEFAULT_DISPLAY_NAME,
        dtmfThrottleRate: -1,

        /**
         * Ensure params set for the external api are defined or else a
         * harmless error message will logged by jitsi-meet.
         */
        preferredCamera: '',
        preferredMic: '',
        preferredSpeaker: '',
        screenshareDevice: ''
    };

    static propTypes = AbstractMeetingFrame.propTypes;

    /**
     * Initializes a new {@code MeetingFrame} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props, MeetingType.JITSI);

        /**
         * The external api exposes toggle actions. Various states are stored
         * locally so any command can be compared to the cached state to prevent
         * calling a toggle action when the desired state has already been
         * achieved.
         */
        this._isAudioMuted = false;
        this._isFilmstripVisible = true;
        this._isHandRaised = false;
        this._isInTileView = false;
        this._isScreensharing = false;
        this._isVideoMuted = false;
        this._localParticipantId = '';

        this._participants = new Map();

        bindAll(this, [
            '_onAudioMuteChange',
            '_onFeedbackPromptDisplayed',
            '_onFeedbackSubmitted',
            '_onFilmstripDisplayChanged',
            '_onMeetingLeft',
            '_onMeetingLoaded',
            '_onParticipantJoined',
            '_onParticipantKicked',
            '_onParticipantLeft',
            '_onPasswordRequired',
            '_onRaiseHandChange',
            '_onRecordingConsentDialogOpen',
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

        /**
         * FIXME: enqueueing touch tones to play is a workaround for consecutive
         * numbers playing over each other and potentially being registered as
         * one tone by voximplant, which is jitsi's dial in/out provider. As a
         * preventative, tones are to be played one at a time with a gap in
         * between.
         */
        this._touchTonesQueue = [];

        /**
         * FIXME: a timeout is used to provide a buffer between each touch tone
         * playing to workaround two consecutive tones being registered as one.
         */
        this._playToneTimeout = null;
    }

    /**
     * Initializes a new instance of the jitsi iframe api and sets status update
     * listeners onto it.
     *
     * @inheritdoc
     */
    componentDidMount() {
        super.componentDidMount();

        const {
            host,
            meetingName,
            path
        } = parseMeetingUrl(this.props.meetingUrl);

        this._jitsiApi = new JitsiMeetExternalAPI(`${host}${path}`, {
            configOverwrite: {
                _desktopSharingSourceDevice: this.props.screenshareDevice,
                ...Boolean(this.props.preferredResolution) && {
                    ...getVideoSettings(this.props.preferredResolution)
                },
                defaultLocalDisplayName: DEFAULT_DISPLAY_NAME,
                desktopSharingFrameRate: {
                    max: this.props.maxDesktopSharingFramerate,
                    min: this.props.minDesktopSharingFramerate
                },
                disableDeepLinking: true,
                displayName: this.props.displayName,
                enableDisplayNameInStats: true,
                iAmSpot: true,
                notificationTimeouts: {
                    extraLong: 15000,
                    sticky: 15000
                },
                prejoinConfig: {
                    enabled: false
                },
                startScreenSharing: Boolean(this.props.screenshareDevice)
                    && this.props.startWithScreenshare,
                startWithVideoMuted: Boolean(this.props.startWithVideoMuted),
                toolbarButtons: []
            },
            devices: {
                audioInput: this.props.preferredMic,
                audioOutput: this.props.preferredSpeaker,
                videoInput: this.props.preferredCamera
            },
            interfaceConfigOverwrite: {
                APP_NAME: this.props.jitsiAppName,
                AUTO_PIN_LATEST_SCREEN_SHARE: true,
                SHOW_CHROME_EXTENSION_BANNER: false
            },
            jwt: this.props.jwt,
            parentNode: this._meetingContainer,
            roomName: meetingName
        });

        // Detect frame load more resiliently. Technically the `onload` option works
        // in recent releases, but this works with older ones too.
        this._jitsiApi.addListener('browserSupport', this._onMeetingLoaded);
        this._jitsiApi.addListener('ready', this._onMeetingLoaded);

        this._jitsiApi.addListener(
            'audioMuteStatusChanged', this._onAudioMuteChange);
        this._jitsiApi.addListener(
            'cameraError', this._onReportDeviceError);
        this._jitsiApi.addListener(
            'feedbackSubmitted', this._onFeedbackSubmitted);
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
            'raiseHandUpdated', this._onRaiseHandChange);
        this._jitsiApi.addListener(
            'readyToClose', this._onMeetingLeave);
        this._jitsiApi.addListener(
            'recordingConsentDialogOpen', this._onRecordingConsentDialogOpen);
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

        this._jitsiApi.executeCommand(
            'displayName',
            this.props.displayName
        );

        this._assumeMeetingFailedTimeout = setTimeout(() => {
            this._leaveIfErrorDetected();
        }, this.props.meetingJoinTimeout);
    }

    /**
     * Removes listeners connected to external services.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        super.componentWillUnmount();

        clearTimeout(this._assumeMeetingFailedTimeout);
        clearTimeout(this._playToneTimeout);

        this._jitsiApi.dispose();

        // TODO: create an action to reset the in-meeting state
        this.props.updateSpotTvState({
            audioMuted: false,
            inMeeting: '',
            kicked: false,
            meetingDisplayName: '',
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
        logger.error('error while loading meeting', {
            iFrameLoaded: this._meetingLoaded,
            meetingJoined: this._meetingJoined
        });

        this._onMeetingLeave({
            errorCode: 'failed-to-join',
            error: 'appEvents.meetingJoinFailed'
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
     * Callback invoked when feedback has been sent successfully through the
     * iFrame api. Will invoke a callback to signify meeting leave if the
     * iFrame is showing feedback, as it would at the end of a call.
     *
     * @private
     * @returns {void}
     */
    _onFeedbackSubmitted() {
        if (this.state.feedbackDisplayed) {
            this._onMeetingLeave();
        }
    }

    /**
     * Callback invoked when a participant has raised their hand.
     *
     * @param {Object} event - The event returned from the external api.
     * @param {string} event.id - The endpoint ID of the participant.
     * @param {number} event.handRaised - Timestamp of when the hand was raised or 0 if not raised.
     * @private
     * @returns {void}
     */
    _onRaiseHandChange({ id, handRaised }) {
        // Ignoring raise hand change for non local participant;
        if (this._localParticipantId !== id) {
            return;
        }

        logger.log('hand raise changed', {
            from: this._isHandRaised,
            to: handRaised
        });

        this._isHandRaised = Boolean(handRaised);

        this.props.updateSpotTvState({ handRaised: this._isHandRaised });
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
        switch (type) {
        case COMMANDS.ADJUST_VOLUME:
            nativeCommands.sendAdjustVolume(data.direction);
            break;

        case COMMANDS.HANG_UP:
            if (data.onlyIfLonelyCall && this._participants.size > 0) {
                logger.log('Skipping hangup due to participants present', {
                    count: this._participants.size
                });

                break;
            }

            this._jitsiApi.executeCommand('hangup');

            if (data.skipFeedback) {
                this._onMeetingLeave();
            }

            break;
        case COMMANDS.GRANT_RECORDING_CONSENT:
            this._jitsiApi.executeCommand(
                'grantRecordingConsent',
                data.unmute
            );
            break;
        case COMMANDS.SEND_TOUCH_TONES:
            this._playTouchTone(data.tones);
            break;

        case COMMANDS.SET_AUDIO_MUTE:
            if (this._isAudioMuted !== data.mute) {
                this._jitsiApi.executeCommand('toggleAudio');
            }
            break;

        case COMMANDS.SET_RAISE_HAND:
            if (this._isHandRaised !== data.handRaised) {
                this._jitsiApi.executeCommand('toggleRaiseHand');
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
    _onMeetingJoined({ id }) {
        clearTimeout(this._assumeMeetingFailedTimeout);

        this._meetingJoined = true;
        this._localParticipantId = id;

        this._enableApiHealthChecks(() => this._jitsiApi.isVideoMuted());

        super._onMeetingJoined();

        this._trySendResizeFilmStripCommand();

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
     * @param {string} event.displayName - The current name of the participant.
     * @private
     * @returns {void}
     */
    _onParticipantJoined({ id, displayName }) {
        this._participants.set(id, displayName);

        // The +1 is is for Spot TV participant which is not included
        const newMax = this._participants.size + 1;

        if (this._maxParticipantCount < newMax) {
            this._maxParticipantCount = newMax;
        }

        this._maybeToggleFilmstripVisibility();
    }

    /**
     * Callback invoked when the local participant has been removed from the
     * conference by another participant.
     *
     * @param {event} param0 - The event returned from the external api.
     * @param {Object} kicked - The participant that was kicked.
     * @param {Object} kicker - The participant that performed the kick.
     * @private
     * @returns {void}
     */
    _onParticipantKicked({ kicked, kicker }) {
        if (kicked.local) {
            logger.log(`Kicked from meeting by ${kicker.id}`);

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
     *
     * @private
     * @returns {void}
     */
    _onMeetingLoaded() {
        // We are adding 2 ways to detect loading so this might trigger twice.
        if (this._meetingLoaded) {
            return;
        }

        logger.log('meeting iframe loaded meeting page');

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
     * Callback invoked when the recording consent dialog is opened.
     * This is used to update the sport remote state to show the recording consent
     * dialog view.
     *
     * @param {boolean} open - Whether the recording consent dialog is
     * currently open or not.
     * @private
     * @returns {void}
     */
    _onRecordingConsentDialogOpen({ open }) {
        logger.log('recording consent dialog state open changed: ', open);

        this.props.updateSpotTvState({
            recordingConsentDialogOpen: open
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

        // Try send resize filmstrip command when tile view mode is turned off.
        if (!enabled) {
            this._trySendResizeFilmStripCommand();
        }
    }

    /**
     * Handler logic to send resize film strip command.
     *
     * @returns {void}
     */
    _trySendResizeFilmStripCommand() {
        const clientWidth = this._getWidth();
        const clientHeight = this._getHeight();
        const currentAspectRatio = clientWidth / clientHeight;

        if (clientWidth >= this.props.filmStripThresholdWidth && currentAspectRatio >= this.props.clientAspectRatio) {
            this._jitsiApi.executeCommand('resizeFilmStrip',
                { width: clientWidth / this.props.filmStripAspectRatioSplit });
        }
    }

    /**
     * Gets the current client width.
     *
     * @returns {number}
     */
    _getWidth() {
        return window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;
    }

    /**
     * Gets the current client height.
     *
     * @returns {number}
     */
    _getHeight() {
        return window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight;
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
     * Callback to invoke to enqueue touch tones to be played.
     *
     * @param {string} newTone - The tone value.
     * @private
     * @returns {void}
     */
    _playTouchTone(newTone = '') {
        if (this.props.dtmfThrottleRate < 0) {
            this._jitsiApi.executeCommand('sendTones', { tones: newTone });

            return;
        }

        this._touchTonesQueue = [
            ...this._touchTonesQueue,
            ...newTone.split('')
        ];

        if (this._playToneTimeout) {
            return;
        }

        const toneToPlay = this._touchTonesQueue.shift();

        if (typeof toneToPlay === 'undefined') {
            return;
        }

        this._jitsiApi.executeCommand('sendTones', { tones: toneToPlay });

        this._playToneTimeout = setTimeout(() => {
            this._playToneTimeout = null;
            this._playTouchTone();
        }, this.props.dtmfThrottleRate);
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
 * Selects parts of the Redux state to pass in with the props of {@code Help}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        filmStripThresholdWidth: getFilmStripThresholdWidth(state),
        clientAspectRatio: getClientAspectRatio(state),
        filmStripAspectRatioSplit: getFilmStripAspectRatioSplit(state)
    };
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

export default connect(mapStateToProps, mapDispatchToProps)(JitsiMeetingFrame);
