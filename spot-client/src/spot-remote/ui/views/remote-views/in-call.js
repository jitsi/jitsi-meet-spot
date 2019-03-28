import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getInMeetingStatus } from 'common/app-state';
import { LoadingIcon } from 'common/ui';
import { isWirelessScreenshareSupported, parseMeetingUrl } from 'common/utils';

import { NavButton, NavContainer } from '../../components';
import {
    AudioMuteButton,
    VideoMuteButton
} from './../../components/nav/buttons';

import ScreenshareModal from './screenshare-modal';

/**
 * A view for displaying ways to interact with the Spot while Spot is in a
 * meeting.
 *
 * @extends React.Component
 */
export class InCall extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        inMeeting: PropTypes.string,
        remoteControlService: PropTypes.object,
        screensharingType: PropTypes.string,
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

        this._isWirelessScreenshareSupported = isWirelessScreenshareSupported();
        this._onCloseScreenshareModal
            = this._onCloseScreenshareModal.bind(this);
        this._onHangUp = this._onHangUp.bind(this);
        this._onStartWiredScreenshare
            = this._onStartWiredScreenshare.bind(this);
        this._onStartWirelessScreenshare
            = this._onStartWirelessScreenshare.bind(this);
        this._onStopScreenshare
            = this._onStopScreenshare.bind(this);
        this._onToggleScreenshare = this._onToggleScreenshare.bind(this);
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
            inMeeting,
            screensharingType,
            wiredScreensharingEnabled
        } = this.props;

        if (!inMeeting) {
            return <LoadingIcon color = 'white' />;
        }

        const { showScreenshareModal } = this.state;
        const screenshareButtonStyles = `sharebutton ${showScreenshareModal
            || screensharingType ? 'active' : ''}`;
        const { meetingName } = parseMeetingUrl(inMeeting);

        return (
            <div className = 'in-call'>
                <div className = 'in-call-name'>{ meetingName }</div>
                <NavContainer>
                    <AudioMuteButton />
                    <VideoMuteButton />
                    <NavButton
                        className = { screenshareButtonStyles }
                        iconName = 'screen_share'
                        label = 'Share Content'
                        onClick = { this._onToggleScreenshare }
                        qaId = {
                            screensharingType ? 'stop-share' : 'start-share'
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
            && !this.props.screensharingType) {
            this.props.remoteControlService.setWirelessScreensharing(true);

            return;
        }

        // Otherwise defer all screensharing choices to the modal.
        this.setState({
            showScreenshareModal: !this.state.showScreenshareModal
        });
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
        return this.props.screensharingType
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
