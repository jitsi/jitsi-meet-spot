import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { addNotification, setMeetingApi } from 'actions';
import { DEFAULT_MEETING_DOMAIN } from 'config';
import { MeetingFrame } from 'features/meeting-frame';
import {
    getDisplayName,
    getMeetingOptions,
    getScreenshareDevice
} from 'reducers';
import { isValidMeetingName, isValidMeetingUrl, logger } from 'utils';
import { ROUTES } from 'routing';

import View from './view';
import { withRemoteControl } from './loaders';

/**
 * Displays the meeting url specified in the url.
 *
 * @extends React.Component
 */
export class Meeting extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        displayName: PropTypes.string,
        history: PropTypes.object,
        location: PropTypes.object,
        match: PropTypes.object,
        screenshareDevice: PropTypes.string,
        showMeetingToolbar: PropTypes.bool
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
        this._onMeetingStart = this._onMeetingStart.bind(this);
    }

    /**
     * Redirects back the home view if no valid meeting url has been detected.
     *
     * @inheritdoc
     */
    componentDidMount() {
        if (!this._getMeetingUrl()) {
            logger.error(
                'No valid meeting url detected. Params are: ',
                this.props.location.search
            );
            this._onMeetingLeave();
        }
    }

    /**
     * Cleans up the redux store of all reference to the meeting.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this.props.dispatch(setMeetingApi(null));
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
                    onMeetingLeave = { this._onMeetingLeave }
                    onMeetingStart = { this._onMeetingStart }
                    screenshareDevice = { this.props.screenshareDevice }
                    showMeetingToolbar = { this.props.showMeetingToolbar } />
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
        const location = queryParams.get('location');

        if (isValidMeetingUrl(location)) {
            return location;
        } else if (isValidMeetingName(location)) {
            return `https://${DEFAULT_MEETING_DOMAIN}/${location}`;
        }

        return null;
    }

    /**
     * Callback invoked when the meeting ends. Attempts to redirect to the
     * calendar.
     *
     * @param {Object} leaveEvent - Details about why the current view is being
     * exited.
     * @param {string} leaveEvent.error - An error, if any, which caused the
     * current view to be exited.
     * @returns {void}
     */
    _onMeetingLeave(leaveEvent = {}) {
        if (leaveEvent.error) {
            this.props.dispatch(addNotification('error', leaveEvent.error));
        }

        this.props.history.push(ROUTES.HOME);
    }

    /**
     * Callback invoked when the process of joining the meeting has started.
     *
     * @param {Object} meetingApi - An instance of {@code JitsiMeetExternalAPI}.
     * @private
     * @returns {void}
     */
    _onMeetingStart(meetingApi) {
        this.props.dispatch(setMeetingApi(meetingApi));
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
        displayName: getDisplayName(state),
        screenshareDevice: getScreenshareDevice(state),
        showMeetingToolbar: getMeetingOptions(state).showMeetingToolbar
    };
}

export default withRemoteControl(connect(mapStateToProps)(Meeting));
