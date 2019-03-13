import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getInMeetingStatus } from 'common/app-state';
import { LoadingIcon } from 'common/ui';
import { parseMeetingUrl } from 'common/utils';

import { NavButton, NavContainer } from '../../components';

import ScreenshareModal from './screenshare-modal';
import { JitsiMeetJSProvider } from 'common/vendor';

/**
 * A view for displaying ways to interact with the Spot while Spot is in a
 * meeting.
 *
 * @extends React.Component
 */
export class InCall extends React.Component {
    static propTypes = {
        audioMuted: PropTypes.bool,
        dispatch: PropTypes.func,
        inMeeting: PropTypes.string,
        remoteControlService: PropTypes.object,
        screensharing: PropTypes.bool,
        screensharingType: PropTypes.string,
        videoMuted: PropTypes.bool,
        wiredScreensharingEnabled: PropTypes.bool
    };

    /**
     * Initializes a new {@code InCall} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            showScreenshareModal: false
        };

        this._isWirelessScreenshareSupported
            = JitsiMeetJSProvider.isWirelessScreenshareSupported();

        this._onCloseScreenshareModal
            = this._onCloseScreenshareModal.bind(this);
        this._onHangUp = this._onHangUp.bind(this);
        this._onStartWiredScreenshare
            = this._onStartWiredScreenshare.bind(this);
        this._onStartWirelessScreenshare
            = this._onStartWirelessScreenshare.bind(this);
        this._onStopScreenshare
            = this._onStopScreenshare.bind(this);
        this._onToggleAudioMute = this._onToggleAudioMute.bind(this);
        this._onToggleScreenshare = this._onToggleScreenshare.bind(this);
        this._onToggleVideoMute = this._onToggleVideoMute.bind(this);
    }

    /**
     * Stops any wireless screensharing in progress with the Spot-Remote.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this.props.remoteControlService.destroyWirelessScreenshareConnections();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            audioMuted,
            inMeeting,
            screensharing,
            screensharingType,
            videoMuted,
            wiredScreensharingEnabled
        } = this.props;

        if (!inMeeting) {
            return <LoadingIcon color = 'white' />;
        }

        const { showScreenshareModal } = this.state;
        const screenshareButtonStyles = `sharebutton ${showScreenshareModal
            || screensharingType ? 'sharing' : ''}`;
        const { meetingName } = parseMeetingUrl(inMeeting);

        return (
            <div className = 'in-call'>
                <div className = 'in-call-name'>{ meetingName }</div>
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
                        className = { screenshareButtonStyles }
                        iconName = 'screen_share'
                        label = 'Share Content'
                        onClick = { this._onToggleScreenshare }
                        qaId = {
                            screensharing ? 'stop-share' : 'start-share'
                        }
                        subIcon = { this._renderScreenshareSubIcon() } />
                    <NavButton
                        className = 'hangup'
                        iconName = 'call_end'
                        label = 'Leave'
                        onClick = { this._onHangUp } />
                </NavContainer>
                { this.state.showScreenshareModal && (
                    <ScreenshareModal
                        onClose = { this._onCloseScreenshareModal }
                        onStartWiredScreenshare
                            = { this._onStartWiredScreenshare }
                        onStartWirelessScreenshare
                            = { this._onStartWirelessScreenshare }
                        onStopScreensharing
                            = { this._onStopScreenshare }
                        screensharing = { screensharing }
                        screensharingType = { screensharingType }
                        wiredScreenshareEnabled
                            = { wiredScreensharingEnabled }
                        wirelessScreenshareEnabled
                            = { this._isWirelessScreenshareSupported } />
                )
                }
            </div>
        );
    }

    /**
     * Sets the {@code ScreenshareModal} to be hidden.
     *
     * @returns {void}
     */
    _onCloseScreenshareModal() {
        this.setState({ showScreenshareModal: false });
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
     * Callback invoked when the screenshare button is clicked. Will either open
     * the screenshare modal or automatically start the wireless screensharing
     * flow.
     *
     * @private
     * @returns {void}
     */
    _onToggleScreenshare() {
        // If only wireless sceensharing is available and there is no
        // screenshare occurring, then start the wireless screensharing flow.
        if (this._isWirelessScreenshareSupported
            && !this.props.wiredScreensharingEnabled
            && !this.props.screensharing) {
            this.props.remoteControlService.setWirelessScreensharing(true);

            return;
        }

        // Otherwise defer all screensharing choices to the modal.
        this.setState({
            showScreenshareModal: !this.state.showScreenshareModal
        });
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
     * Triggers wired screensharing to be enabled.
     *
     * @private
     * @returns {void}
     */
    _onStartWiredScreenshare() {
        this.props.remoteControlService.setScreensharing(true);
    }

    /**
     * Triggers the wireless screensharing flow to be started.
     *
     * @private
     * @returns {void}
     */
    _onStartWirelessScreenshare() {
        this.props.remoteControlService.setWirelessScreensharing(true);
    }

    /**
     * Turns off any active screenshare.
     *
     * @private
     * @returns {void}
     */
    _onStopScreenshare() {
        this.props.remoteControlService.setScreensharing(false);

        // Special case to immedaitely close the modal when stopping screenshare
        // while only wireless screenshare is available.
        if (this._isWirelessScreenshareSupported
            && !this.props.wiredScreensharingEnabled) {
            this._onCloseScreenshareModal();
        }
    }

    /**
     * Renders the element on the screenshare button which shows screenshare is
     * active.
     *
     * @private
     * @returns {ReactElement | null}
     */
    _renderScreenshareSubIcon() {
        return this.props.screensharing
            ? <div className = 'on-indicator' />
            : null;
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code InCall}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        ...getInMeetingStatus(state)
    };
}

export default connect(mapStateToProps)(InCall);
