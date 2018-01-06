import React from 'react';
import PropTypes from 'prop-types';
import ScheduledMeeting from './scheduled-meeting';

export default class ScheduledMeetings extends React.Component {
    static propTypes = {
        onMeetingClick: PropTypes.func,
        events: PropTypes.array
    };

    render() {
        const events = (this.props.events || []).map(event =>
            <ScheduledMeeting
                key = { event.id }
                event = { event }
                onMeetingClick = { this.props.onMeetingClick } />
        );

        return (
            <div id = 'meeting-list'>
                { events.length ? events : <div></div> }
            </div>
        );
    }
}
