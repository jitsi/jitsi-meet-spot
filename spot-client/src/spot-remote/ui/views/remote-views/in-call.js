import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import {
    forceStopWirelessScreenshare,
    getInMeetingStatus,
    getInvitedPhoneNumber,
    hangUp,
    hideModal
} from 'common/app-state';
import { CallEnd } from 'common/icons';
import { LoadingIcon, Modal } from 'common/ui';

import {
    submitPassword
} from '../../../app-state';
import {
    AudioMuteButton,
    KickedNotice,
    MoreButton,
    MeetingHeader,
    NavButton,
    NavContainer,
    PasswordPrompt,
    ScreenshareButton,
    VideoMuteButton
} from '../../components';
import { formatPhoneNumber } from '../../utils/formatPhoneNumber';

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
        invitedPhoneNumber: PropTypes.string,
        kicked: PropTypes.bool,
        meetingDisplayName: PropTypes.string,
        onForceStopWirelessScreenshare: PropTypes.func,
        onHangUp: PropTypes.func,
        onShowScreenshareModal: PropTypes.func,
        onSubmitPassword: PropTypes.func,
        showPasswordPrompt: PropTypes.bool,
        t: PropTypes.func
    };

    /**
     * Initializes a new {@code InCall} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onHangup = this._onHangup.bind(this);
        this._onHangUpWithoutFeedback = this._onHangUpWithoutFeedback.bind(this);
    }

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
            invitedPhoneNumber,
            kicked,
            meetingDisplayName,
            showPasswordPrompt
        } = this.props;

        if (kicked) {
            return (
                <Modal>
                    <KickedNotice onSubmit = { this._onHangUpWithoutFeedback } />
                </Modal>
            );
        }

        if (showPasswordPrompt) {
            return (
                <Modal>
                    <PasswordPrompt
                        onCancel = { this._onHangUpWithoutFeedback }
                        onSubmit = { this.props.onSubmitPassword } />
                </Modal>
            );
        }

        if (!inMeeting) {
            return <LoadingIcon />;
        }

        return (
            <div
                className = 'in-call'
                data-qa-id = 'in-call'>
                <MeetingHeader
                    invitedPhoneNumber = { invitedPhoneNumber }
                    meetingDisplayName = { meetingDisplayName }
                    meetingUrl = { inMeeting } />
                <NavContainer>
                    <AudioMuteButton />
                    <VideoMuteButton />
                    <ScreenshareButton />
                    <MoreButton />
                    <NavButton
                        className = 'hangup'
                        label = { this.props.t('commands.hangUp') }
                        onClick = { this._onHangup }
                        qaId = 'hangup'>
                        <CallEnd />
                    </NavButton>
                </NavContainer>
            </div>
        );
    }

    /**
     * Callback invokved to leave the call and allow showing of the feedback
     * prompt.
     *
     * @private
     * @returns {void}
     */
    _onHangup() {
        this.props.onHangUp(false);
    }

    /**
     * Callback invoked to leave the call but without showing feedback.
     *
     * @private
     * @returns {void}
     */
    _onHangUpWithoutFeedback() {
        this.props.onHangUp(true);
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
        meetingDisplayName,
        needPassword
    } = getInMeetingStatus(state);

    return {
        inMeeting,
        invitedPhoneNumber: formatPhoneNumber(getInvitedPhoneNumber(state)),
        kicked,
        meetingDisplayName,
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
         * @param {boolean} skipFeedback - True if the post-call feedback should
         * not be shown.
         * @returns {Promise}
         */
        onHangUp(skipFeedback) {
            return dispatch(hangUp(skipFeedback));
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

export default connect(mapStateToProps, mapDispatchToProps)(
    withTranslation()(InCall)
);
