import React from 'react';
import PropTypes from 'prop-types';
import ScheduledMeeting from './scheduled-meeting';

/**
 * A component for displaying a list of meetings.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function ScheduledMeetings({ events, onMeetingClick }) {
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

ScheduledMeetings.defaultProps = {
    events: []
};

ScheduledMeetings.propTypes = {
    events: PropTypes.array,
    onMeetingClick: PropTypes.func
};
