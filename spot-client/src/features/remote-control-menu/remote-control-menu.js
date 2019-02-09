import PropTypes from 'prop-types';
import React from 'react';

import { NavButton } from 'features/nav-button';
import { JitsiMeetJSProvider } from 'vendor';

/**
 * Displays buttons used for remotely controlling a Spot instance.
 *
 * @extends React.Component
 */
export default class RemoteControlMenu extends React.Component {
    static propTypes = {
        audioMuted: PropTypes.bool,
        isWirelessScreenshareConnectionActive: PropTypes.bool,
        remoteControlService: PropTypes.object,
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
            isWirelessScreenshareConnectionActive,
            screensharing,
            screensharingEnabled,
            videoMuted
        } = this.props;


        let wirelessScreensharingLabel;
        let wirelessScrensharingIcon;

        if (isWirelessScreenshareConnectionActive && !screensharing) {
            wirelessScreensharingLabel = 'Connecting...';
            wirelessScrensharingIcon = 'screen_share';
        } else if (screensharing) {
            wirelessScreensharingLabel = 'Stop Sharing';
            wirelessScrensharingIcon = 'stop_screen_share';
        } else {
            wirelessScreensharingLabel = 'Share Wirelessly';
            wirelessScrensharingIcon = 'screen_share';
        }

        return (
            <div className = 'nav'>
                <NavButton
                    iconName = { audioMuted ? 'mic_off' : 'mic' }
                    label = { audioMuted ? 'Umute Audio' : 'Mute Audio' }
                    onClick = { this._onToggleAudioMute } />
                <NavButton
                    iconName = { videoMuted ? 'videocam_off' : 'videocam' }
                    label = { videoMuted ? 'Unmute Video' : 'Mute Video' }
                    onClick = { this._onToggleVideoMute } />
                { screensharingEnabled
                    && <NavButton
                        iconName = { screensharing
                            ? 'stop_screen_share' : 'screen_share' }
                        label = { screensharing
                            ? 'Stop Sharing' : 'Share Content' }
                        onClick = { this._onToggleScreensharing } /> }
                { this._isWirelessScreenshareSupported()
                    && <NavButton
                        iconName = { wirelessScrensharingIcon }
                        label = { wirelessScreensharingLabel }
                        onClick = { this._onToggleWirelessScreensharing } /> }
                <NavButton
                    className = 'hangup'
                    iconName = 'call_end'
                    label = 'Leave'
                    onClick = { this._onHangUp } />
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
     * Starts or stops local screensharing.
     *
     * @private
     * @returns {void}
     */
    _onToggleScreensharing() {
        this.props.remoteControlService.setScreensharing(
            !this.props.screensharing);
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

    /**
     * Changes the current wireless screensharing state.
     *
     * @private
     * @returns {void}
     */
    _onToggleWirelessScreensharing() {
        const {
            isWirelessScreenshareConnectionActive,
            remoteControlService,
            screensharing
        } = this.props;

        // No-op if a proxy connection to set up screensharing is in progress.
        if (isWirelessScreenshareConnectionActive && !screensharing) {
            return;
        }

        remoteControlService.setWirelessScreensharing(!screensharing);
    }
}
