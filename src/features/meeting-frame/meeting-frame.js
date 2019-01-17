/* global JitsiMeetExternalAPI */

import PropTypes from 'prop-types';
import React from 'react';
import { remoteControlService } from 'remote-control';
import { logger, parseMeetingUrl } from 'utils';

import styles from './meeting-frame.css';

/**
 * The iFrame used to to display a meeting hosted on a jitsi instance.
 *
 * @extends React.Component
 */
export default class MeetingFrame extends React.Component {
    static propTypes = {
        displayName: PropTypes.string,
        meetingUrl: PropTypes.string,
        onMeetingLeave: PropTypes.func,
        onMeetingStart: PropTypes.func,
        screenshareDevice: PropTypes.string
    };

    static defaultProps = {
        displayName: ''
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
        this._onMeetingJoined = this._onMeetingJoined.bind(this);
        this._onMeetingLeft = this._onMeetingLeft.bind(this);
        this._onMeetingLoaded = this._onMeetingLoaded.bind(this);
        this._onScreenshareChange = this._onScreenshareChange.bind(this);
        this._onVideoMuteChange = this._onVideoMuteChange.bind(this);
        this._setMeetingContainerRef = this._setMeetingContainerRef.bind(this);

        this._jitsiApi = null;
        this._meetingContainer = null;
        this._meetingLoaded = false;
        this._meetingJoined = false;
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
                _desktopSharingSourceDevice: this.props.screenshareDevice
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

        this._assumeMeetingFailedTimeout = setTimeout(() => {
            this._leaveIfErrorDetected();
        }, 10000);
    }

    /**
     * Removes listeners connected to external services.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        clearTimeout(this._assumeMeetingFailedTimeout);
        clearTimeout(this._showingFeedbackTimeout);

        // Reset now-stale in-meeting status.
        remoteControlService.notifyAudioMuteStatus(true);
        remoteControlService.notifyScreenshareStatus(false);
        remoteControlService.notifyVideoMuteStatus(true);

        this._jitsiApi.dispose();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <div
                className = { styles.frame }
                ref = { this._setMeetingContainerRef } />
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
            'Assuming an error occured while joining the meeting',
            'iFrame loaded:', this._meetingLoaded,
            'meeting join:', this._meetingJoined
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
        this._isAudioMuted = muted;

        remoteControlService.notifyAudioMuteStatus(muted);
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
        remoteControlService.notifyMeetingJoinStatus(true);
    }

    /**
     * Updates the known status of Spot to remote controllers.
     *
     * @private
     * @returns {void}
     */
    _onMeetingLeft() {
        remoteControlService.notifyMeetingJoinStatus(false);

        // FIXME: the iframe api does not provide an event for when the
        // (post-call) feedback dialog is displayed. Assume the feedback
        // dialog has been displayed if the conference does not
        // immediately fire the "readyToClose" event.
        this._showingFeedbackTimeout = setTimeout(() => {
            remoteControlService.notifyViewStatus('feedback');
        }, 500);
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
        this._isScreensharing = on;

        remoteControlService.notifyScreenshareStatus(on);
    }

    /**
     * Callback invoked after toggling video mute from within the jitsi meeting.
     *
     * @param {Object} event - The mute event from JitsiMeetExternalAPI.
     * @private
     * @returns {void}
     */
    _onVideoMuteChange({ muted }) {
        this._isVideoMuted = muted;

        remoteControlService.notifyVideoMuteStatus(muted);
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
