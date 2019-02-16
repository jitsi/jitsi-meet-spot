import PropTypes from 'prop-types';
import React from 'react';

import { JitsiMeetJSProvider } from 'common/vendor';
import { NavButton } from './../nav-button';

import Popover from './popover';
import ScreensharePicker from './screenshare-picker';

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

        this.state = {
            showScreensharePicker: false
        };

        this._onHangUp = this._onHangUp.bind(this);
        this._onHideScreensharePicker
            = this._onHideScreensharePicker.bind(this);
        this._onToggleScreensharePicker
            = this._onToggleScreensharePicker.bind(this);
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
        const { audioMuted, videoMuted } = this.props;

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
                { this._renderScreensharingButton() }
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
     * Hides the screenshare picker.
     *
     * @private
     * @returns {void}
     */
    _onHideScreensharePicker() {
        this.setState({
            showScreensharePicker: false
        });
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
        this._onHideScreensharePicker();

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
     * Changes whether the screenshare picker is displayed or not.
     *
     * @private
     * @returns {void}
     */
    _onToggleScreensharePicker() {
        this.setState({
            showScreensharePicker: !this.state.showScreensharePicker
        });
    }

    /**
     * Changes the current wireless screensharing state.
     *
     * @private
     * @returns {void}
     */
    _onToggleWirelessScreensharing() {
        this._onHideScreensharePicker();

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

    /**
     * Returns the screenshare button that should be displayed, if any.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderScreensharingButton() {
        const {
            screensharing,
            screensharingEnabled
        } = this.props;
        const canWirelessScreenshare = this._isWirelessScreenshareSupported();

        // If neither screensharing mode is allowed then show nothing.
        if (!screensharingEnabled && !canWirelessScreenshare) {
            return null;
        }

        // If screensharing is active and at least one mode is allowed then show
        // a stop button.
        if (screensharing) {
            return (
                <NavButton
                    iconName = 'stop_screen_share'
                    label = 'Stop Sharing'
                    onClick = { this._onToggleScreensharing } />
            );
        }

        // If only wired screensharing is enabled show only its button.
        if (screensharingEnabled && !canWirelessScreenshare) {
            return (
                <NavButton
                    className = 'screenshare'
                    iconName = 'screen_share'
                    label = 'Share Content'
                    onClick = { this._onToggleScreensharing } />
            );
        }

        // If only wireless screensharing is enabled show only its button.
        // if (true) {
        if (canWirelessScreenshare && !screensharingEnabled) {
            return (
                <NavButton
                    className = 'screenshare'
                    iconName = 'screen_share'
                    label = 'Share Content'
                    onClick = { this._onToggleWirelessScreensharing } />
            );
        }

        // If both screensharings are allowed but neither is active then show
        // a screenshare picker.
        return (
            <Popover
                onOutsideClick = { this._onHideScreensharePicker }
                popoverContent = {
                    <ScreensharePicker
                        onStartWiredScreenshare
                            = { this._onToggleScreensharing }
                        onStartWirelessScreenshare
                            = { this._onToggleWirelessScreensharing } />
                }
                ref = { this._screensharePickerRef }
                showPopover = { this.state.showScreensharePicker }>
                <NavButton
                    iconName = 'screen_share'
                    label = 'Share Content'
                    onClick = { this._onToggleScreensharePicker } />
            </Popover>
        );
    }
}
