import PropTypes from 'prop-types';
import React from 'react';
import { date } from 'utils';

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

        return (
            <div
                className = 'meeting'
                onClick = { this._onMeetingClick }>
                <div className = 'meeting-time'>
                    { date.formatToTime(startTime) }
                </div>
                <div className = 'meeting-name'>
                    { title }
                </div>
                <div />
                <div className = 'meeting-url'>
                    { this._removeProtocolFromUrl(meetingUrl) }
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
     * Invoke the {@code onMeetingClick} callback if a meeting name exists.
     *
     * @private
     * @returns {void}
     */
    _onMeetingClick() {
        if (this.props.event.meetingUrl) {
            this.props.onMeetingClick(this.props.event.meetingUrl);
        }
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
