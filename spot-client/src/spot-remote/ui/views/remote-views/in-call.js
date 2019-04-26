import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    getInMeetingStatus,
    hangUp,
    startWirelessScreensharing,
    startWiredScreensharing,
    stopScreenshare
} from 'common/app-state';
import { CallEnd, ScreenShare } from 'common/icons';
import { LoadingIcon, RoomName } from 'common/ui';
import { isWirelessScreenshareSupported, parseMeetingUrl } from 'common/utils';

import { NavButton, NavContainer } from '../../components';
import {
    AudioMuteButton,
    VideoMuteButton
} from './../../components/nav/buttons';

import ScreenshareModal from './screenshare-modal';

/**
 * A view for displaying ways to interact with the Spot-TV while Spot-TV is in a
 * meeting.
 *
 * @extends React.Component
 */
export class InCall extends React.Component {
    static propTypes = {
        inMeeting: PropTypes.string,
        onHangUp: PropTypes.func,
        onStartWiredScreenshare: PropTypes.func,
        onStartWirelessScreenshare: PropTypes.func,
        onStopScreenshare: PropTypes.func,
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
        this._onStopScreenshare
            = this._onStopScreenshare.bind(this);
        this._onToggleScreenshare = this._onToggleScreenshare.bind(this);
    }

    /**
     * Stops any wireless screensharing in progress from the Spot-Remote.
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
                <div className = 'view-header'>
                    <div className = 'in-call-name'>{ meetingName }</div>
                    <RoomName render = { this._generateRoomNameString } />
                </div>
                <NavContainer>
                    <AudioMuteButton />
                    <VideoMuteButton />
                    <NavButton
                        className = { screenshareButtonStyles }
                        label = 'Share Content'
                        onClick = { this._onToggleScreenshare }
                        qaId = {
                            screensharingType ? 'stop-share' : 'start-share'
                        }
                        subIcon = { this._renderScreenshareSubIcon() }>
                        <ScreenShare />
                    </NavButton>
                    <NavButton
                        className = 'hangup'
                        label = 'Leave'
                        onClick = { this.props.onHangUp }>
                        <CallEnd />
                    </NavButton>
                </NavContainer>
                { this.state.showScreenshareModal && (
                    <ScreenshareModal
                        onClose = { this._onCloseScreenshareModal }
                        onStartWiredScreenshare
                            = { this.props.onStartWiredScreenshare }
                        onStartWirelessScreenshare
                            = { this.props.onStartWirelessScreenshare }
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
     * Custom render function for displaying the Spot-Room name.
     *
     * @param {string} roomName - The name of the Spot-Room.
     * @private
     * @returns {ReactElement|null}
     */
    _generateRoomNameString(roomName) {
        return roomName
            ? (
                <div>
                    <div>
                        at
                    </div>
                    <div>
                        { roomName }
                    </div>
                </div>
            )
            : null;
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
            this.props.onStartWirelessScreenshare();

            return;
        }

        // Otherwise defer all screensharing choices to the modal.
        this.setState({
            showScreenshareModal: !this.state.showScreenshareModal
        });
    }

    /**
     * Turns off any active screenshare.
     *
     * @private
     * @returns {void}
     */
    _onStopScreenshare() {
        this.props.onStopScreenshare()
            .then(() => {
                // Special case to immediately close the modal when stopping
                // screenshare while only wireless screenshare is available.
                if (this._isWirelessScreenshareSupported
                    && !this.props.wiredScreensharingEnabled) {
                    this._onCloseScreenshareModal();
                }
            });
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

/**
 * Creates actions which can update Redux state.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        /**
         * Leaves the currently joined meeting.
         *
         * @returns {Promise}
         */
        onHangUp() {
            return dispatch(hangUp());
        },

        /**
         * Triggers the wireless screensharing flow to be started.
         *
         * @returns {Promise}
         */
        onStartWirelessScreenshare() {
            return dispatch(startWirelessScreensharing());
        },

        /**
         * Triggers wired screensharing to be enabled.
         *
         * @returns {void}
         */
        onStartWiredScreenshare() {
            dispatch(startWiredScreensharing());
        },

        /**
         * Turns off any active screenshare.
         *
         * @returns {Promise}
         */
        onStopScreenshare() {
            return dispatch(stopScreenshare());
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InCall);
