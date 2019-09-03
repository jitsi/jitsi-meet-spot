import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    forceStopWirelessScreenshare,
    getInMeetingStatus,
    hangUp,
    hideModal,
    isVolumeControlSupported,
    shouldShowDtmf
} from 'common/app-state';
import { CallEnd } from 'common/icons';
import { LoadingIcon, Modal, RoomName } from 'common/ui';
import { parseMeetingUrl } from 'common/utils';

import {
    submitPassword
} from '../../../app-state';
import {
    AudioMuteButton,
    KickedNotice,
    MoreButton,
    NavButton,
    NavContainer,
    PasswordPrompt,
    ScreenshareButton,
    TileViewButton,
    VideoMuteButton
} from '../../components';

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
        kicked: PropTypes.bool,
        onForceStopWirelessScreenshare: PropTypes.func,
        onHangUp: PropTypes.func,
        onShowScreenshareModal: PropTypes.func,
        onSubmitPassword: PropTypes.func,
        showMoreButton: PropTypes.bool,
        showPasswordPrompt: PropTypes.bool
    };

    /**
     * Stops any wireless screensharing in progress from the Spot-Remote.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this.props.hideModal();

        // Force stop wireless screenshare in case there is a connection in
        // flight, as only established connections get automatically cleaned up.
        this.props.onForceStopWirelessScreenshare();
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
            kicked,
            showMoreButton,
            showPasswordPrompt
        } = this.props;

        if (kicked) {
            return (
                <Modal>
                    <KickedNotice onSubmit = { this.props.onHangUp } />
                </Modal>
            );
        }

        if (showPasswordPrompt) {
            return (
                <Modal>
                    <PasswordPrompt
                        onCancel = { this.props.onHangUp }
                        onSubmit = { this.props.onSubmitPassword } />
                </Modal>
            );
        }

        if (!inMeeting) {
            return <LoadingIcon />;
        }

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
                    <ScreenshareButton />
                    { showMoreButton ? <MoreButton /> : <TileViewButton /> }
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
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code InCall}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    const {
        inMeeting,
        kicked,
        needPassword
    } = getInMeetingStatus(state);

    return {
        inMeeting,
        kicked,
        showMoreButton: shouldShowDtmf(state) || isVolumeControlSupported(state),
        showPasswordPrompt: needPassword
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
         * Immediately stops any wireless screensharing in progress.
         *
         * @returns {void}
         */
        onForceStopWirelessScreenshare() {
            dispatch(forceStopWirelessScreenshare());
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
         * Attempts to enter a locked meeting using the provided password.
         *
         * @param {string} password - The password to use to enter the meeting.
         * @returns {Promise}
         */
        onSubmitPassword(password) {
            return dispatch(submitPassword(password));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InCall);
