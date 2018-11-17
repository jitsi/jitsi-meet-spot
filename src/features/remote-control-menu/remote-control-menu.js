import PropTypes from 'prop-types';
import React from 'react';

import { COMMANDS, remoteControlService } from 'remote-control';

import AudioMuteButton from './buttons/audio-mute-button';
import HangupButton from './buttons/hangup-button';
import ScreenshareButton from './buttons/screenshare-button';
import VideoMuteButton from './buttons/video-mute-button';

import styles from './remote-control-menu.css';

/**
 * Displays buttons used for remotely controlling the main application.
 *
 * @extends React.Component
 */
export default class RemoteControlMenu extends React.Component {
    static propTypes = {
        audioMuted: PropTypes.bool,
        remoteId: PropTypes.string,
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

        // FIXME: There is no event coming from the jitsi-meet iframe api to
        // successful screenshare start or stop. So for now assume success and
        // update state to toggle the screenshare button display. In the future,
        // listen for updates from the iframe and update the button based on
        // the update.
        this.state = {
            isScreensharing: false
        };

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
        const { audioMuted, videoMuted } = this.props;

        return (
            <div className = { styles.menu }>
                <AudioMuteButton
                    isMuted = { audioMuted }
                    onClick = { this._onToggleAudioMute } />
                <VideoMuteButton
                    isMuted = { videoMuted }
                    onClick = { this._onToggleVideoMute } />
                <ScreenshareButton
                    isScreensharing = { this.state.isScreensharing }
                    onClick = { this._onToggleScreenshare } />
                <HangupButton onClick = { this._onHangUp } />
            </div>
        );
    }

    /**
     * Leaves the currently joined conference.
     *
     * @private
     * @returns {void}
     */
    _onHangUp() {
        remoteControlService.sendCommand(this.props.remoteId, COMMANDS.HANG_UP);
    }

    /**
     * Changes the current local audio mute state.
     *
     * @private
     * @returns {void}
     */
    _onToggleAudioMute() {
        remoteControlService.sendCommand(
            this.props.remoteId, COMMANDS.TOGGLE_AUDIO_MUTE);
    }

    /**
     * Starts or stops local screensharing.
     *
     * @private
     * @returns {void}
     */
    _onToggleScreenshare() {
        remoteControlService.sendCommand(
            this.props.remoteId, COMMANDS.TOGGLE_SCREENSHARE);

        this.setState({
            isScreensharing: !this.state.isScreensharing
        });
    }

    /**
     * Changes the current local video mute state.
     *
     * @private
     * @returns {void}
     */
    _onToggleVideoMute() {
        remoteControlService.sendCommand(
            this.props.remoteId, COMMANDS.TOGGLE_VIDEO_MUTE);
    }
}
