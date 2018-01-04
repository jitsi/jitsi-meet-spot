import PropTypes from 'prop-types';
import React from 'react';

import styles from './scheduled-meeting.css';

export default class ScheduledMeeting extends React.Component {
    static propTypes = {
        onMeetingClick: PropTypes.func,
        event: PropTypes.object
    };

    constructor(props) {
        super(props);

        this._onMeetingClick = this._onMeetingClick.bind(this);
    }

    render() {
        const { event } = this.props;

        const time = new Date(event.start.dateTime);
        const name = event.summary;
        const participants = event.attendees.map(attendee => {
            return <span key = { attendee.email }>{ attendee.email }</span>
        });

        return (
            <div
                className = { styles.meeting }
                onClick = { this._onMeetingClick }>
                <div className = { styles.time }>
                    { time.toLocaleTimeString() }
                </div>
                <div className = { styles.details }>
                    <div className = { styles.name }>
                        { name }
                    </div>
                    <div className = { styles.participants }>
                        { participants }
                    </div>
                </div>
            </div>
        );
    }

    _onMeetingClick() {
        this.props.onMeetingClick(this._parseMeetingLocation());
    }

    _parseMeetingLocation() {
        // eslint-disable-next-line no-useless-escape
        const linkRegex = /https?:\/\/[^\s]+\/([^\s\/]+)/g;
        const matches = linkRegex.exec(this.props.event.location);

        // eslint-disable-next-line no-useless-escape
        return matches[1].replace(/,\s*$/, '');
    }
}
