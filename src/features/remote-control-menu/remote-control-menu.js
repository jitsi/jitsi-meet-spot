import PropTypes from 'prop-types';
import React from 'react';

import { COMMANDS, remoteControlService } from 'remote-control';

import AudioMuteButton from './buttons/audio-mute-button';
import HangupButton from './buttons/hangup-button';
import ScreenshareButton from './buttons/screenshare-button';
import VideoMuteButton from './buttons/video-mute-button';

import styles from './remote-control-menu.css';

/**
 * Displays buttons used for remotely controlling a Spot instance.
 *
 * @extends React.Component
 */
export default class RemoteControlMenu extends React.Component {
    static propTypes = {
        audioMuted: PropTypes.bool,
        screensharing: PropTypes.bool,
        targetResource: PropTypes.string,
        videoMuted: PropTypes.bool
    };

    /**
     * Initializes a new {@code RemoteControlMenu} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onHangUp = this._onHangUp.bind(this);
        this._onToggleAudioMute = this._onToggleAudioMute.bind(this);
        this._onToggleScreenshare = this._onToggleScreenshare.bind(this);
        this._onToggleVideoMute = this._onToggleVideoMute.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const { audioMuted, screensharing, videoMuted } = this.props;

        return (
            <div className = { styles.menu }>
                <AudioMuteButton
                    isMuted = { audioMuted }
                    onClick = { this._onToggleAudioMute } />
                <VideoMuteButton
                    isMuted = { videoMuted }
                    onClick = { this._onToggleVideoMute } />
                <ScreenshareButton
                    isScreensharing = { screensharing }
                    onClick = { this._onToggleScreenshare } />
                <HangupButton onClick = { this._onHangUp } />
            </div>
        );
    }

    /**
     * Leaves the currently joined meeting.
     *
     * @private
     * @returns {void}
     */
    _onHangUp() {
        remoteControlService.sendCommand(
            this.props.targetResource,
            COMMANDS.HANG_UP
        );
    }

    /**
     * Changes the current local audio mute state.
     *
     * @private
     * @returns {void}
     */
    _onToggleAudioMute() {
        remoteControlService.sendCommand(
            this.props.targetResource,
            COMMANDS.TOGGLE_AUDIO_MUTE
        );
    }

    /**
     * Starts or stops local screensharing.
     *
     * @private
     * @returns {void}
     */
    _onToggleScreenshare() {
        remoteControlService.sendCommand(
            this.props.targetResource,
            COMMANDS.TOGGLE_SCREENSHARE
        );
    }

    /**
     * Changes the current local video mute state.
     *
     * @private
     * @returns {void}
     */
    _onToggleVideoMute() {
        remoteControlService.sendCommand(
            this.props.targetResource,
            COMMANDS.TOGGLE_VIDEO_MUTE
        );
    }
}
