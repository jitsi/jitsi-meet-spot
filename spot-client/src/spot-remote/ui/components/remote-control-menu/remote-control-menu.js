import PropTypes from 'prop-types';
import React from 'react';

import { NavButton, NavContainer } from '../nav';

/**
 * Displays buttons used for remotely controlling a Spot instance.
 *
 * @extends React.Component
 */
export default class RemoteControlMenu extends React.Component {
    static propTypes = {
        audioMuted: PropTypes.bool,
        onToggleScreenshare: PropTypes.func,
        remoteControlService: PropTypes.object,
        screensharingEnabled: PropTypes.bool,
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
            <NavContainer>
                <NavButton
                    iconName = { audioMuted ? 'mic_off' : 'mic' }
                    label
                        = { audioMuted ? 'Umute Audio' : 'Mute Audio' }
                    onClick = { this._onToggleAudioMute } />
                <NavButton
                    iconName
                        = { videoMuted ? 'videocam_off' : 'videocam' }
                    label
                        = { videoMuted ? 'Unmute Video' : 'Mute Video' }
                    onClick = { this._onToggleVideoMute } />
                <NavButton
                    className = { 'sharebutton' }
                    iconName = 'screen_share'
                    label = 'Share Content'
                    onClick = { this.props.onToggleScreenshare } />
                <NavButton
                    className = 'hangup'
                    iconName = 'call_end'
                    label = 'Leave'
                    onClick = { this._onHangUp } />
            </NavContainer>
        );
    }

    /**
     * Leaves the currently joined meeting.
     *
     * @private
     * @returns {void}
     */
    _onHangUp() {
        this.props.remoteControlService.hangUp();
    }

    /**
     * Changes the current local audio mute state.
     *
     * @private
     * @returns {void}
     */
    _onToggleAudioMute() {
        this.props.remoteControlService.setAudioMute(!this.props.audioMuted);
    }

    /**
     * Changes the current local video mute state.
     *
     * @private
     * @returns {void}
     */
    _onToggleVideoMute() {
        this.props.remoteControlService.setVideoMute(!this.props.videoMuted);
    }
}
