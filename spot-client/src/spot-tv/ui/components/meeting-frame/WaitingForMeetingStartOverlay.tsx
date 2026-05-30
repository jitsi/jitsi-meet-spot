import { StatusOverlay } from 'common/ui';
import React from 'react';
import { withTranslation } from 'react-i18next';


interface IProps {
    t?: (key: string) => string;
}

/**
 * Renders a text overlay which hides meeting frame when actively attempting to
 * join a meeting that has yet to begun so it cannot be joined.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function WaitingForMeetingStartOverlay({ t }: IProps) {
    return (
        <StatusOverlay title = { t?.('conferenceStatus.meetingNotStarted') }>
            <div>{ t?.('conferenceStatus.waitingForStart') }</div>
        </StatusOverlay>
    );
}

export default withTranslation()(WaitingForMeetingStartOverlay);
