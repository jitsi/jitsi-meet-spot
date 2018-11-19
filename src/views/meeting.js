import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { VALID_MEETING_HOSTS } from 'config';
import { MeetingFrame } from 'features/meeting-frame';
import { getDisplayName } from 'reducers';
import { isValidMeetingUrl } from 'utils';

import View from './view';

/**
 * Displays the jitsi conference.
 *
 * @extends React.Component
 */
export class Meeting extends React.Component {
    static propTypes = {
        displayName: PropTypes.string,
        history: PropTypes.object,
        location: PropTypes.object,
        match: PropTypes.object
    };

    /**
     * Initializes a new {@code Meeting} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onMeetingLeave = this._onMeetingLeave.bind(this);
    }

    /**
     * Redirects back the home view if no valid meeting url has been detected.
     *
     * @inheritdoc
     */
    componentDidMount() {
        if (!this._getMeetingUrl()) {
            this._onMeetingLeave();
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const meetingUrl = this._getMeetingUrl();

        if (!meetingUrl) {
            return null;
        }

        return (
            <View name = 'meeting'>
                <MeetingFrame
                    displayName = { this.props.displayName }
                    meetingUrl = { meetingUrl }
                    onMeetingLeave = { this._onMeetingLeave } />
            </View>
        );
    }

    /**
     * Parses the current window location for a valid meeting url. The value
     * {@code null} will be returned if no valid meeting url is found.
     *
     * @private
     * @returns {string|null}
     */
    _getMeetingUrl() {
        const queryParams = new URLSearchParams(this.props.location.search);
        const meetingUrl = queryParams.get('location');

        if (!meetingUrl) {
            return null;
        }

        if (isValidMeetingUrl(meetingUrl, VALID_MEETING_HOSTS)) {
            return meetingUrl;
        }

        return `https://${VALID_MEETING_HOSTS[0]}/${meetingUrl}`;
    }

    /**
     * Callback invoked when the conference ends. Attempts to redirect to the
     * home view.
     */
    _onMeetingLeave() {
        this.props.history.push('/');
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code Meeting}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        displayName: getDisplayName(state)
    };
}

export default connect(mapStateToProps)(Meeting);
