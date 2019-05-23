import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    getInMeetingStatus,
    hangUp,
    isModalOpen,
    showModal,
    hideModal,
    startWirelessScreensharing
} from 'common/app-state';
import { CallEnd, MoreVert, ScreenShare } from 'common/icons';
import { LoadingIcon, RoomName } from 'common/ui';
import { isWirelessScreenshareSupported, parseMeetingUrl } from 'common/utils';

import { NavButton, NavContainer } from '../../components';
import {
    AudioMuteButton,
    VideoMuteButton
} from './../../components/nav/buttons';

import MoreModal from './more-modal';
import ScreenshareModal from './screenshare-modal';

/**
 * A view for displaying ways to interact with the Spot-TV while Spot-TV is in a
 * meeting.
 *
 * @extends React.Component
 */
export class InCall extends React.Component {
    static propTypes = {
        hideModal: PropTypes.func,
        inMeeting: PropTypes.string,
        isMoreModalOpen: PropTypes.bool,
        isScreenshareModalOpen: PropTypes.bool,
        onHangUp: PropTypes.func,
        onShowMoreModal: PropTypes.func,
        onShowScreenshareModal: PropTypes.func,
        onStartWirelessScreenshare: PropTypes.func,
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

        this._isWirelessScreenshareSupported = isWirelessScreenshareSupported();

        this._onToggleMoreModal = this._onToggleMoreModal.bind(this);
        this._onToggleScreenshare = this._onToggleScreenshare.bind(this);
    }

    /**
     * Stops any wireless screensharing in progress from the Spot-Remote.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this.props.hideModal();

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
            screensharingType
        } = this.props;

        if (!inMeeting) {
            return <LoadingIcon color = 'white' />;
        }

        const { isScreenshareModalOpen, isMoreModalOpen } = this.props;
        const screenshareButtonStyles = `sharebutton ${isScreenshareModalOpen
            || screensharingType ? 'active' : ''}`;
        const moreButtonStyles = isMoreModalOpen ? 'active' : '';
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
                        className = { moreButtonStyles }
                        label = 'More'
                        onClick = { this._onToggleMoreModal }
                        qaId = 'more'>
                        <MoreVert />
                    </NavButton>
                    <NavButton
                        className = 'hangup'
                        label = 'Leave'
                        onClick = { this.props.onHangUp }>
                        <CallEnd />
                    </NavButton>
                </NavContainer>
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
     * Displays the {@code MoreModal} or hides the currently displayed modal.
     *
     * @private
     * @returns {void}
     */
    _onToggleMoreModal() {
        if (this.props.isMoreModalOpen) {
            this.props.hideModal();
        } else {
            this.props.onShowMoreModal();
        }
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
        if (this.props.isScreenshareModalOpen) {
            this.props.hideModal();
        }

        // If only wireless sceensharing is available and there is no
        // screenshare occurring, then start the wireless screensharing flow.
        if (this._isWirelessScreenshareSupported
            && !this.props.wiredScreensharingEnabled
            && !this.props.screensharingType) {
            this.props.onStartWirelessScreenshare();

            return;
        }

        // Otherwise defer all screensharing choices to the modal.
        this.props.onShowScreenshareModal();
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
        ...getInMeetingStatus(state),
        isScreenshareModalOpen: isModalOpen(state, ScreenshareModal),
        isMoreModalOpen: isModalOpen(state, MoreModal)
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
         * Stop displaying all modals.
         *
         * @returns {void}
         */
        hideModal() {
            dispatch(hideModal());
        },

        /**
         * Leaves the currently joined meeting.
         *
         * @returns {Promise}
         */
        onHangUp() {
            return dispatch(hangUp());
        },

        /**
         * Displays the {@code MoreModal} for additional in-meeting functions.
         *
         * @returns {void}
         */
        onShowMoreModal() {
            return dispatch(showModal(MoreModal));
        },

        /**
         * Displays the {@code ScreenshareModal} to interact with wired and/or
         * wireless screensharing.
         *
         * @returns {void}
         */
        onShowScreenshareModal() {
            dispatch(showModal(ScreenshareModal));
        },

        /**
         * Triggers the wireless screensharing flow to be started.
         *
         * @returns {Promise}
         */
        onStartWirelessScreenshare() {
            return dispatch(startWirelessScreensharing());
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InCall);
