import PropTypes from 'prop-types';
import React from 'react';

import { COMMANDS, remoteControlService } from 'remote-control';

import AudioMuteButton from './buttons/audio-mute-button';
import HangupButton from './buttons/hangup-button';
import ScreenshareButton from './buttons/screenshare-button';
import VideoMuteButton from './buttons/video-mute-button';

import styles from './remote-control-menu.css';

export default class RemoteControlMenu extends React.Component {
    static propTypes = {
        audioMuted: PropTypes.bool,
        remoteId: PropTypes.string,
        videoMuted: PropTypes.bool
    };

    constructor(props) {
        super(props);

        this._onHangUp = this._onHangUp.bind(this);
        this._onToggleAudioMute = this._onToggleAudioMute.bind(this);
        this._onToggleScreenshare = this._onToggleScreenshare.bind(this);
        this._onToggleVideoMute = this._onToggleVideoMute.bind(this);
    }

    render() {
        const { audioMuted, videoMuted } = this.props;

        return (
            <div className = { styles.menu }>
                <AudioMuteButton
                    isMuted = { audioMuted }
                    onClick = { this._onToggleAudioMute } />
                <VideoMuteButton
                    isMuted = { videoMuted }
                    onClick = { this._onToggleVideoMute } />
                <ScreenshareButton onClick = { this._onToggleScreenshare } />
                <HangupButton onClick = { this._onHangUp } />
            </div>
        );
    }

    _onHangUp() {
        remoteControlService.sendCommand(this.props.remoteId, COMMANDS.HANG_UP);
    }

    _onToggleAudioMute() {
        remoteControlService.sendCommand(
            this.props.remoteId, COMMANDS.TOGGLE_AUDIO_MUTE);
    }

    _onToggleScreenshare() {
        remoteControlService.sendCommand(
            this.props.remoteId, COMMANDS.TOGGLE_SCREENSHARE);
    }

    _onToggleVideoMute() {
        remoteControlService.sendCommand(
            this.props.remoteId, COMMANDS.TOGGLE_VIDEO_MUTE);
    }
}
