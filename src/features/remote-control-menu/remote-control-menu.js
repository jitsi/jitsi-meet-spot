import PropTypes from 'prop-types';
import React from 'react';

import { Button } from 'features/button';
import { COMMANDS, remoteControlService } from 'remote-control';

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
            <div>
                <div>
                    <Button onClick = { this._onToggleAudioMute }>
                        { audioMuted ? 'Audio Unmute' : 'Audio Mute' }
                    </Button>
                </div>
                <div>
                    <Button onClick = { this._onHangUp }>
                        Hangup
                    </Button>
                </div>
                <div>
                    <Button onClick = { this._onToggleVideoMute }>
                        { videoMuted ? 'Video Unmute' : 'Video Mute' }
                    </Button>
                </div>
                <div>
                    <Button onClick = { this._onToggleScreenshare }>
                        Toggle Screenshare
                    </Button>
                </div>
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
