import PropTypes from 'prop-types';
import React from 'react';
import { date } from 'utils';
import Avatar from './avatar';
import styles from './scheduled-meeting.css';

export default class ScheduledMeeting extends React.Component {
    static propTypes = {
        event: PropTypes.object,
        onMeetingClick: PropTypes.func
    };

    constructor(props) {
        super(props);

        this._onMeetingClick = this._onMeetingClick.bind(this);
    }

    render() {
        const {
            conferenceUrl,
            meetingName,
            participants,
            start
        } = this.props.event;
        const startTime = new Date(start);
        const className = startTime.getTime() <= Date.now()
            ? `meeting ${styles.meeting} ${styles.ongoing}`
            : `meeting ${styles.meeting}`;

        return (
            <div
                className = { className }
                onClick = { this._onMeetingClick }>
                <div className = { styles.time }>
                    { date.formatToTime(startTime) }
                </div>
                <div className = { styles.details }>
                    <div className = { styles.name }>
                        { meetingName }
                    </div>
                    <div className = { styles.url }>
                        { conferenceUrl }
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
        if (this.props.event.conferenceName) {
            this.props.onMeetingClick(this.props.event.conferenceName);
        }
    }
}
