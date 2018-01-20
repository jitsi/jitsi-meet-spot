/* global JitsiMeetExternalAPI */

import PropTypes from 'prop-types';
import React from 'react';
import { remoteControlService } from 'remote-control';
import styles from './meeting-frame.css';

const MEETING_DOMAN = 'meet.jit.si';

export default class MeetingFrame extends React.Component {
    static propTypes = {
        displayName: PropTypes.string,
        meetingName: PropTypes.string,
        onMeetingLeave: PropTypes.func
    };

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

    componentDidMount() {
        this._jitsiApi = new JitsiMeetExternalAPI(MEETING_DOMAN, {
            roomName: this.props.meetingName,
            parentNode: this._meetingContainer
        });

        this._jitsiApi.addListener('readyToClose', this.props.onMeetingLeave);
        this._jitsiApi.addListener(
            'videoMuteStatusChanged', this._onVideoMuteChange);
        this._jitsiApi.addListener(
            'audioMuteStatusChanged', this._onAudioMuteChange);
        this._jitsiApi.executeCommand('displayName', this.props.displayName);
    }

    componentWillUnmount() {
        remoteControlService.removeCommandListener(this._onCommand);

        this._jitsiApi.removeListener(
            'readyToClose', this.props.onMeetingLeave);
        this._jitsiApi.dispose();
    }

    render() {
        return (
            <div
                className = { styles.frame }
                ref = { this._setMeetingContainerRef } />
        );
    }

    _onAudioMuteChange(event) {
        remoteControlService.sendPresence(
            'audioMuted', JSON.stringify(event.muted));
    }

    _onVideoMuteChange(event) {
        remoteControlService.sendPresence(
            'videoMuted', JSON.stringify(event.muted));
    }

    _onCommand(command) {
        this._jitsiApi.executeCommand(command);
    }

    _setMeetingContainerRef(ref) {
        this._meetingContainer = ref;
    }
}
