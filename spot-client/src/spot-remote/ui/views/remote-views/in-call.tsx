import type { RootState } from 'common/app-state';
import {
    forceStopWirelessScreenshare,
    getInMeetingStatus,
    getInvitedPhoneNumber,
    getMeetingCancelTimeout,
    hangUp,
    hideModal,
    showModal
} from 'common/app-state';
import { LoadingIcon, Modal } from 'common/ui';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';


import {
    submitPassword
} from '../../../app-state';
import {
    CancelMeetingPrompt,
    KickedNotice,
    MeetingHeader,
    PasswordPrompt
} from '../../components';
import RecordingConsentDialog from '../../components/recording-consent/RecordingConsentDialog';
import { formatPhoneNumber } from '../../utils/formatPhoneNumber';

import { MeetingToolbar } from './../../components/meeting-toolbar';

interface IInCallProps {
    hideModal: () => void;
    inMeeting?: string;
    invitedPhoneNumber?: string;
    kicked?: boolean;
    meetingCancelTimeout?: number;
    meetingDisplayName?: string;
    onForceStopWirelessScreenshare: () => void;
    onHangUp: () => void;
    onShowModal: (component: any) => void;
    onShowScreenshareModal?: (...args: any[]) => void;
    onSubmitPassword: (password: string) => any;
    recordingConsentDialogOpen?: boolean;
    showPasswordPrompt?: boolean;
    t?: (key: string) => string;
}

interface IInCallState {
    showCancelMeeting: boolean;
}

/**
 * A view for displaying ways to interact with the Spot-TV while Spot-TV is in a
 * meeting.
 */
export class InCall extends React.Component<IInCallProps, IInCallState> {
    _showCancelMeetingTimeout: ReturnType<typeof setTimeout> | null;

    /**
     * Initializes a new {@code InCall} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IInCallProps) {
        super(props);

        this.state = {
            showCancelMeeting: false
        };

        this._showCancelMeetingTimeout = null;
    }

    /**
     * Starts timer to show a button to cancel joining the meeting.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._showCancelMeetingTimeout = setTimeout(() => {
            this.setState({
                showCancelMeeting: true
            });
        }, this.props.meetingCancelTimeout);
    }

    /**
     * Prevents the cancel meeting button from displaying if the meeting has
     * been joined.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps: IInCallProps) {
        // Handle recording consent dialog state changes
        const { recordingConsentDialogOpen: prevDialogOpen } = prevProps;
        const {
            inMeeting,
            recordingConsentDialogOpen: currentDialogOpen
        } = this.props;

        if (this._showCancelMeetingTimeout && inMeeting) {
            clearTimeout(this._showCancelMeetingTimeout);
            this._showCancelMeetingTimeout = null;
        }

        // Only show or hide the recording consent dialog if its state has changed
        if (!prevDialogOpen && currentDialogOpen) {
            this.props.onShowModal(RecordingConsentDialog);
        }
    }

    /**
     * Stops any wireless screensharing in progress from the Spot-Remote.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this.props.hideModal();

        if (this._showCancelMeetingTimeout) {
            clearTimeout(this._showCancelMeetingTimeout);
        }

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
            return this.state.showCancelMeeting
                ? (
                    <Modal>
                        <CancelMeetingPrompt onSubmit = { this.props.onHangUp } />
                    </Modal>
                )
                : <LoadingIcon />;
        }

        return (
            <div
                className = 'in-call'
                data-qa-id = 'in-call'>
                <MeetingHeader
                    invitedPhoneNumber = { invitedPhoneNumber }
                    meetingDisplayName = { meetingDisplayName }
                    meetingUrl = { inMeeting } />
                <MeetingToolbar meetingUrl = { inMeeting } />
            </div>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code InCall}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: RootState) {
    const {
        inMeeting,
        kicked,
        meetingDisplayName,
        needPassword,
        recordingConsentDialogOpen
    } = getInMeetingStatus(state);

    return {
        inMeeting,
        invitedPhoneNumber: formatPhoneNumber(getInvitedPhoneNumber(state)),
        kicked,
        meetingCancelTimeout: getMeetingCancelTimeout(state),
        meetingDisplayName,
        recordingConsentDialogOpen,
        showPasswordPrompt: needPassword
    };
}

/**
 * Creates actions which can update Redux state.
 *
 * @param dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch: any) {
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
         * Leaves the currently joined meeting and skip feedback.
         *
         * @returns {Promise}
         */
        onHangUp() {
            return dispatch(hangUp(true));
        },

        /**
         * Shows a modal with the specified component.
         *
         * @param component - The component to show in the modal.
         * @returns {void}
         */
        onShowModal(component: any) {
            dispatch(showModal(component));
        },

        /**
         * Attempts to enter a locked meeting using the provided password.
         *
         * @param password - The password to use to enter the meeting.
         * @returns {Promise}
         */
        onSubmitPassword(password: string) {
            return dispatch(submitPassword(password));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    withTranslation()(InCall)
);
