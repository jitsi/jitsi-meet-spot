import React from 'react';
import PropTypes from 'prop-types';
import ScheduledMeeting from './scheduled-meeting';
import { Navigatable } from 'features/accessibility';

/**
 * A component for displaying a list of meetings.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function ScheduledMeetings({ events, onMeetingClick }) {
    return (
        <div id = 'meeting-list'>
            {
                events.map(event =>
                    <Navigatable key = { event.id }>
                        <ScheduledMeeting
                            event = { event }
                            onMeetingClick = { onMeetingClick } />
                    </Navigatable>
                )
            }
        </div>
    );
}

ScheduledMeetings.defaultProps = {
    events: []
};

ScheduledMeetings.propTypes = {
    onMeetingClick: PropTypes.func,
    events: PropTypes.array
};
