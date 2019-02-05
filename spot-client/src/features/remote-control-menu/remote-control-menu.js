import PropTypes from 'prop-types';
import React from 'react';

import { LoadingIcon } from 'features/loading-icon';
import { remoteControlService } from 'remote-control';
import { JitsiMeetJSProvider } from 'vendor';

import AudioMuteButton from './buttons/audio-mute-button';
import HangupButton from './buttons/hangup-button';
import ScreenshareButton from './buttons/screenshare-button';
import VideoMuteButton from './buttons/video-mute-button';
import WirelessScreenshareButton from './buttons/wireless-screenshare-button';

/**
 * Displays buttons used for remotely controlling a Spot instance.
 *
 * @extends React.Component
 */
export default class RemoteControlMenu extends React.Component {
    static propTypes = {
        audioMuted: PropTypes.bool,
        inMeeting: PropTypes.bool,
        isWirelessScreenshareConnectionActive: PropTypes.bool,
        screensharing: PropTypes.bool,
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
        this._onToggleScreensharing = this._onToggleScreensharing.bind(this);
        this._onToggleVideoMute = this._onToggleVideoMute.bind(this);
        this._onToggleWirelessScreensharing
            = this._onToggleWirelessScreensharing.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const {
            audioMuted,
            inMeeting,
            isWirelessScreenshareConnectionActive,
            screensharing,
            screensharingEnabled,
            videoMuted
        } = this.props;

        if (!inMeeting) {
            return <LoadingIcon color = 'white' />;
        }

        return (
            <div className = 'remote-menu'>
                <AudioMuteButton
                    isMuted = { audioMuted }
                    onClick = { this._onToggleAudioMute } />
                <VideoMuteButton
                    isMuted = { videoMuted }
                    onClick = { this._onToggleVideoMute } />
                { screensharingEnabled
                    && <ScreenshareButton
                        isScreensharing = { screensharing }
                        onClick = { this._onToggleScreensharing } /> }
                { this._isWirelessScreenshareSupported()
                    && <WirelessScreenshareButton
                        isScreensharing = { screensharing }
                        isWirelessScreenshareConnectionActive
                            = { isWirelessScreenshareConnectionActive }
                        onClick = { this._onToggleWirelessScreensharing } /> }
                <HangupButton onClick = { this._onHangUp } />
            </div>
        );
    }

    /**
     * Returns whether or not the current environment supports wirelessly
     * screensharing into a Spot. Currently only Chrome works and the underlying
     * implementation assumes getDisplayMedia is available.
     *
     * @private
     * @returns {void}
     */
    _isWirelessScreenshareSupported() {
        const JitsiMeetJS = JitsiMeetJSProvider.get();

        return JitsiMeetJS.util.browser.isChrome()
            && JitsiMeetJS.util.browser.supportsGetDisplayMedia();
    }

    /**
     * Leaves the currently joined meeting.
     *
     * @private
     * @returns {void}
     */
    _onHangUp() {
        remoteControlService.hangUp();
    }

    /**
     * Changes the current local audio mute state.
     *
     * @private
     * @returns {void}
     */
    _onToggleAudioMute() {
        remoteControlService.setAudioMute(!this.props.audioMuted);
    }

    /**
     * Starts or stops local screensharing.
     *
     * @private
     * @returns {void}
     */
    _onToggleScreensharing() {
        remoteControlService.setScreensharing(!this.props.screensharing);
    }

    /**
     * Changes the current local video mute state.
     *
     * @private
     * @returns {void}
     */
    _onToggleVideoMute() {
        remoteControlService.setVideoMute(!this.props.videoMuted);
    }

    /**
     * Changes the current wireless screensharing state.
     *
     * @private
     * @returns {void}
     */
    _onToggleWirelessScreensharing() {
        const {
            isWirelessScreenshareConnectionActive,
            screensharing
        } = this.props;

        // No-op if a proxy connection to set up screensharing is in progress.
        if (isWirelessScreenshareConnectionActive && !screensharing) {
            return;
        }

        remoteControlService.setWirelessScreensharing(!screensharing);
    }
}
