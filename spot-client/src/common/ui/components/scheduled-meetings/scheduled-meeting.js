import { date } from 'common/date';
import { logger } from 'common/logger';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';


import { Button } from './../button';

/**
 * Displays details about a meeting and response to clicks.
 */
export class ScheduledMeeting extends React.Component {
    static propTypes = {
        event: PropTypes.object,
        onMeetingClick: PropTypes.func,
        t: PropTypes.func
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
        const joinNowClasses
            = `meeting-join ${this._hasMeetingToJoin() ? '' : 'hidden'}`;

        return (
            <div
                className = 'meeting'
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
                <div className = { joinNowClasses }>
                    <Button
                        appearance = 'subtle'
                        className = 'join-cta'>
                        { this.props.t('calendar.join') }
                    </Button>
                </div>
            </div>
        );
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
            return this.props.t('calendar.today');
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

        this.props.onMeetingClick(
            this.props.event.meetingUrl,
            this.props.event.title
        );
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

export default withTranslation()(ScheduledMeeting);
