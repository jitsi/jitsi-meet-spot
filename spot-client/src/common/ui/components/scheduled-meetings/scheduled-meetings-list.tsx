import React from 'react';

import ScheduledMeeting from './scheduled-meeting';

interface IProps {

    /**
     * The list of meeting events to display.
     */
    events?: any[];

    /**
     * Callback invoked when a meeting is clicked.
     */
    onMeetingClick?: (...args: any[]) => void;
}

/**
 * A component for displaying a list of meetings.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function ScheduledMeetings({ events = [], onMeetingClick }: IProps) {
    return (
        <div className = 'meetings'>
            {
                events.map(event => (
                    <ScheduledMeeting
                        event = { event }
                        key = { event.id }
                        onMeetingClick = { onMeetingClick } />
                ))
            }
        </div>
    );
}
