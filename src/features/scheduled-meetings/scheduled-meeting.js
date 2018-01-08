import moment from 'moment';
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
        const { meetingName, name, participants, start } = this.props.event;
        const startTime = new Date(start);
        const className = startTime.getTime() <= Date.now()
            ? `meeting ${styles.meeting} ${styles.ongoing}`
            : `meeting ${styles.meeting}`;

        return (
            <div
                className = { className }
                onClick = { this._onMeetingClick }>
                <div className = { styles.time }>
                    { moment(startTime).format('hh:mm') }
                </div>
                <div className = { styles.details }>
                    <div className = { styles.name }>
                        { meetingName }
                    </div>
                    <div className = { styles.participants }>
                        { this._generateAvatars(participants) }
                    </div>
                </div>
            </div>
        );
    }

    _generateAvatars(participants = []) {
        return participants.map(participant =>
            <Avatar
                key = { participant.email }
                email = { participant.email } />
        );
    }

    _onMeetingClick() {
        this.props.onMeetingClick(this.props.event.conferenceName);
    }
}
