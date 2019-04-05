import PropTypes from 'prop-types';
import React from 'react';

import { logger } from 'common/logger';
import { date } from 'common/utils';

import Avatar from './avatar';

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
            meetingUrl,
            start,
            title
        } = this.props.event;
        const startTime = new Date(start);
        const hasMeetingToJoin = this._hasMeetingToJoin();

        return (
            <div
                className = { `meeting ${hasMeetingToJoin ? '' : 'no-url'} ` }
                onClick = { this._onMeetingClick }>
                <div className = 'meeting-info-container'>
                    <div className = 'time-info'>
                        <div className = 'meeting-date'>
                            { this._getFormattedDate(startTime) }
                        </div>
                        <div className = 'meeting-name'>
                            { title }
                        </div>
                    </div>
                    <div className = 'meeting-info'>
                        <div className = 'meeting-time'>
                            { this._getFormattedTimes(startTime) }
                        </div>
                        <div className = 'meeting-url'>
                            { this._removeProtocolFromUrl(meetingUrl) }
                        </div>
                    </div>
                </div>
                <div className = { `meeting-join ${hasMeetingToJoin ? '' : 'hidden'}` }>
                    <button className = 'join-cta'>Join Now</button>
                </div>
            </div>
        );
    }

    /**
     * Creates a React Element for each meeting participant for displaying that
     * participant's avatar.
     *
     * @param {Array<Object>} participants - The event participants to display
     * as avatars.
     * @private
     * @returns {Array<ReactElement>}
     */
    _generateAvatars(participants = []) {
        return participants.map(participant => (
            <Avatar
                email = { participant.email }
                key = { participant.email } />
        ));
    }

    /**
     * Returns the calendar date for the meeting.
     *
     * @param {Date} startTime - An instance of {@code Date}.
     * @private
     * @returns {string}
     */
    _getFormattedDate(startTime) {
        if (date.isDateForToday(startTime)) {
            return 'Today';
        }

        return date.formatToCalendarDate(startTime);
    }

    /**
     * Returns the start time of the meeting.
     *
     * @param {Date} startTime - An instance of {@code Date}.
     * @private
     * @returns {string}
     */
    _getFormattedTimes(startTime) {
        return date.formatToTime(startTime);
    }

    /**
     * Returns whether or not the meeting item has a meeting url which can be
     * joined.
     *
     * @private
     * @returns {boolean}
     */
    _hasMeetingToJoin() {
        return Boolean(
            this.props.onMeetingClick
                && this.props.event.meetingUrl
        );
    }

    /**
     * Invoke the {@code onMeetingClick} callback if a meeting name exists.
     *
     * @private
     * @returns {void}
     */
    _onMeetingClick() {
        if (!this._hasMeetingToJoin()) {
            logger.log('scheduledMeeting clicked on meeting without url');

            return;
        }

        logger.log('scheduledMeeting clicked on meeting with url');

        this.props.onMeetingClick(this.props.event.meetingUrl);
    }

    /**
     * Helper to remove the protocol from a url.
     *
     * @param {string} url - The URL which should have its protocol removed.
     * @returns {string}
     */
    _removeProtocolFromUrl(url) {
        return (url || '').replace(/(^\w+:|^)\/\//, '');
    }
}
