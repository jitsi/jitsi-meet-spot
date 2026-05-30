import React from 'react';

import JitsiMeetingToolbar from './JitsiMeetingToolbar';

interface IProps {
    meetingUrl?: string;
}

/**
 * A component for showing in-meeting controls for a Spot-Remote to control
 * the meeting on the Spot-TV.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function MeetingToolbar(_props: IProps) {
    return <JitsiMeetingToolbar />;
}
