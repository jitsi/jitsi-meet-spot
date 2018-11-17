/* global JitsiMeetExternalAPI */

import PropTypes from 'prop-types';
import React from 'react';
import { MEETING_DOMAIN } from 'config';
import { COMMANDS, remoteControlService } from 'remote-control';

import styles from './meeting-frame.css';

/**
 * The iFrame used to to display a jitsi conference.
 *
 * @extends React.Component
 */
export default class MeetingFrame extends React.Component {
    static propTypes = {
        displayName: PropTypes.string,
        meetingName: PropTypes.string,
        onMeetingLeave: PropTypes.func
    };

    /**
     * Initializes a new {@code MeetingFrame} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._setMeetingContainerRef = this._setMeetingContainerRef.bind(this);
        this._onCommand = this._onCommand.bind(this);
        this._onVideoMuteChange = this._onVideoMuteChange.bind(this);
        this._onAudioMuteChange = this._onAudioMuteChange.bind(this);

        this._jitsiApi = null;
        this._meetingContainere = null;

        remoteControlService.addCommandListener(this._onCommand);
    }

    /**
     * Initializes a new instance of the jitsi iframe api and sets status update
     * listeners onto it.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._jitsiApi = new JitsiMeetExternalAPI(MEETING_DOMAIN, {
            roomName: this.props.meetingName,
            parentNode: this._meetingContainer
        });

        this._jitsiApi.addListener(
            'videoMuteStatusChanged', this._onVideoMuteChange);
        this._jitsiApi.addListener(
            'readyToClose', this.props.onMeetingLeave);
        this._jitsiApi.addListener(
            'audioMuteStatusChanged', this._onAudioMuteChange);
        this._jitsiApi.executeCommand('displayName', this.props.displayName);
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
     * Callback invoked after toggling audio mute from within the conference
     * iframe.
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
     * Callback invoked after toggling video mute from within the conference
     * iframe.
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
     * conference.
     *
     * @param {HTMLIFrameElement} ref
     * @private
     * @returns {void}
     */
    _setMeetingContainerRef(ref) {
        this._meetingContainer = ref;
    }
}
