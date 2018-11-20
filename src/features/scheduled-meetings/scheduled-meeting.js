import PropTypes from 'prop-types';
import React from 'react';
import { date } from 'utils';

import Avatar from './avatar';
import styles from './scheduled-meeting.css';

/**
 * Displays details about a meeting and response to clicks.
 *
 * @extends React.Component
 */
export default class ScheduledMeeting extends React.Component {
    static propTypes = {
        event: PropTypes.object,
        onMeetingClick: PropTypes.func
    };

    /**
     * Initializes a new {@code ScheduledMeeting} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onMeetingClick = this._onMeetingClick.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
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

    /**
     * Creates a React Element for each meeting participant for displaying that
     * participant's avatar.
     *
     * @param {Array<Object>} participants
     * @private
     * @returns {Array<ReactElement>}
     */
    _generateAvatars(participants = []) {
        return participants.map(participant =>
            <Avatar
                key = { participant.email }
                email = { participant.email } />
        );
    }

    /**
     * Invoke the {@code onMeetingClick} callback if a meeting name exists.
     *
     * @private
     * @returns {void}
     */
    _onMeetingClick() {
        if (this.props.event.conferenceUrl) {
            this.props.onMeetingClick(this.props.event.conferenceUrl);
        }
    }
}
