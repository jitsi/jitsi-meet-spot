import PropTypes from 'prop-types';
import React from 'react';

import Avatar from './avatar';

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
                        { this._generateAvatars() }
                    </div>
                </div>
            </div>
        );
    }

    _generateAvatars() {
        return this.props.event.attendees.map(attendee => {
            return (
                <Avatar
                    key = { attendee.email }
                    email = { attendee.email } />
            );
        });
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
