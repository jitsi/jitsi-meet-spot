import { getInMeetingStatus, getInvitedPhoneNumber } from 'common/app-state';
import { ScreenShare } from 'common/icons';
import { Button, LoadingIcon } from 'common/ui';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';


import { MeetingHeader } from '../../components';
import { formatPhoneNumber } from '../../utils/formatPhoneNumber';

interface IProps {
    inMeeting?: string;
    invitedPhoneNumber?: string;
    meetingDisplayName?: string;
    onStopScreenshare?: (...args: any[]) => void;
    t?: (key: string) => string;
}

/**
 * Displays a button for stopping wireless screenshare in progress.
 */
export class StopShare extends React.Component<IProps> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns
     */
    render() {
        const {
            meetingDisplayName,
            inMeeting,
            invitedPhoneNumber,
            onStopScreenshare,
            t
        } = this.props;

        if (!inMeeting) {
            return <LoadingIcon />;
        }

        return (
            <div
                className = 'stop-share'
                data-qa-id = 'stop-share'>
                <MeetingHeader
                    invitedPhoneNumber = { invitedPhoneNumber }
                    meetingDisplayName = { meetingDisplayName }
                    meetingUrl = { inMeeting } />
                <div className = 'stop-share-title'>
                    { t?.('screenshare.isSharingScreen') }
                </div>
                <div className = 'stop-share-icon'>
                    <ScreenShare />
                </div>
                <Button
                    className = 'stop-share-button'
                    onClick = { onStopScreenshare }
                    qaId = 'stop-share-button'>
                    { t?.('screenshare.stopSharing') }
                </Button>
            </div>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code InCall}.
 *
 * @param state - The Redux state.
 * @private
 * @returns
 */
function mapStateToProps(state: any) {
    const {
        meetingDisplayName,
        inMeeting
    } = getInMeetingStatus(state);

    return {
        inMeeting,
        invitedPhoneNumber: formatPhoneNumber(getInvitedPhoneNumber(state)),
        meetingDisplayName
    };
}

export default connect(mapStateToProps)(withTranslation()(StopShare));
