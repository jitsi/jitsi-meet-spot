import { RoomName } from 'common/ui';
import { parseMeetingUrl } from 'common/utils';
import React from 'react';
import { JoinInfo } from 'spot-tv/ui/components';

/**
 * The props for {@link MeetingHeader}.
 */
interface IProps {

    /**
     * The phone number invited to the meeting, if any.
     */
    invitedPhoneNumber?: string;

    /**
     * The display name for the meeting.
     */
    meetingDisplayName?: string;

    /**
     * The URL for the current meeting.
     */
    meetingUrl?: string;
}

/**
 * Displays current meeting information.
 */
export default class MeetingHeader extends React.Component<IProps> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            invitedPhoneNumber,
            meetingDisplayName,
            meetingUrl
        } = this.props;
        const { meetingName } = parseMeetingUrl(meetingUrl ?? '');

        return (
            <div className = 'view-header'>
                <RoomName />
                { invitedPhoneNumber && <div className = 'in-call-invited-phone'>{ invitedPhoneNumber }</div> }
                <div className = { invitedPhoneNumber ? 'in-call-name-with-phone' : 'in-call-name' } >
                    { meetingDisplayName || meetingName }
                </div>
                <div className = 'in-call-meeting-url' >
                    <JoinInfo showDomain = { true } />
                </div>
            </div>
        );
    }
}
