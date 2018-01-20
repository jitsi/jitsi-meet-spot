import React from 'react';
import PropTypes from 'prop-types';
import ScheduledMeeting from './scheduled-meeting';

export default class ScheduledMeetings extends React.Component {
    static defaultProps = {
        events: []
    };

    static propTypes = {
        onMeetingClick: PropTypes.func,
        events: PropTypes.array
    };

    render() {
        const { events, onMeetingClick } = this.props;

        return (
            <div id = 'meeting-list'>
                {
                    events.map(event =>
                        <ScheduledMeeting
                            key = { event.id }
                            event = { event }
                            onMeetingClick = { onMeetingClick } />
                    )
                }
            </div>
        );
    }
}
