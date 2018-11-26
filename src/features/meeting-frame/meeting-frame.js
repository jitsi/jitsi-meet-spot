/* global JitsiMeetExternalAPI */

import PropTypes from 'prop-types';
import React from 'react';
import { COMMANDS, remoteControlService } from 'remote-control';
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
        onMeetingLeave: PropTypes.func
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

        this._onAudioMuteChange = this._onAudioMuteChange.bind(this);
        this._onCommand = this._onCommand.bind(this);
        this._onMeetingJoined = this._onMeetingJoined.bind(this);
        this._onMeetingLoaded = this._onMeetingLoaded.bind(this);
        this._onVideoMuteChange = this._onVideoMuteChange.bind(this);
        this._setMeetingContainerRef = this._setMeetingContainerRef.bind(this);

        this._jitsiApi = null;
        this._meetingContainer = null;
        this._meetingLoaded = false;
        this._meetingJoined = false;

        remoteControlService.addCommandListener(this._onCommand);
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
            roomName: meetingName,
            onload: this._onMeetingLoad,
            parentNode: this._meetingContainer
        });

        this._jitsiApi.addListener(
            'videoMuteStatusChanged', this._onVideoMuteChange);
        this._jitsiApi.addListener(
            'readyToClose', this.props.onMeetingLeave);
        this._jitsiApi.addListener(
            'audioMuteStatusChanged', this._onAudioMuteChange);
        this._jitsiApi.executeCommand('displayName', this.props.displayName);

        this._jitsiApi.addListener(
            'videoConferenceJoined', this._onMeetingJoined);

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
        remoteControlService.removeCommandListener(this._onCommand);

        this._jitsiApi.removeListener(
            'readyToClose', this.props.onMeetingLeave);
        this._jitsiApi.removeListener(
            'feedbackSubmitted', this.props.onMeetingLeave);
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

        this.props.onMeetingLeave();
    }

    /**
     * Callback invoked after toggling audio mute from within the jitsi meeting.
     *
     * @private
     * @returns {void}
     */
    _onAudioMuteChange(event) {
        remoteControlService.sendPresence(
            'audioMuted', JSON.stringify(event.muted));
    }

    /**
     * Callback invoked to execute a remote control command.
     *
     * @param {string} command - The type of the command.
     * @param {Object} options - Additional details on how to execute the
     * command.
     * @private
     * @returns {void}
     */
    _onCommand(command, options) {
        if (command === COMMANDS.HANG_UP) {
            remoteControlService.sendPresence('view', 'feedback');
            this._jitsiApi.executeCommand(command, options);
        } else if (command === COMMANDS.SUBMIT_FEEDBACK) {
            this._jitsiApi.addListener(
                'feedbackSubmitted', this.props.onMeetingLeave);
            this._jitsiApi.executeCommand(command, options);
        } else {
            this._jitsiApi.executeCommand(command, options);
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
     * Callback invoked after toggling video mute from within the jitsi meeting.
     *
     * @private
     * @returns {void}
     */
    _onVideoMuteChange(event) {
        remoteControlService.sendPresence(
            'videoMuted', JSON.stringify(event.muted));
    }

    /**
     * Sets the internal reference to the iFrame element displaying the jitsi
     * meeting.
     *
     * @param {HTMLIFrameElement} ref
     * @private
     * @returns {void}
     */
    _setMeetingContainerRef(ref) {
        this._meetingContainer = ref;
    }
}
