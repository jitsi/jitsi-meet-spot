import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { addNotification, setCalendarEvents } from 'actions';

import { LoadingIcon } from 'features/loading-icon';
import { MeetingNameEntry } from 'features/meeting-name-entry';
import { FeedbackForm, RemoteControlMenu } from 'features/remote-control-menu';
import { ScheduledMeetings } from 'features/scheduled-meetings';
import {
    getCalendarEvents,
    getInMeetingStatus,
    getCurrentView,
    isConnectedToSpot
} from 'reducers';

import { withRemoteControl } from './loaders';
import View from './view';
import styles from './view.css';

/**
 * Displays the remote control view for controlling a Spot instance from another
 * browser window.
 *
 * @extends React.Component
 */
export class RemoteControl extends React.Component {
    static propTypes = {
        audioMuted: PropTypes.bool,
        dispatch: PropTypes.func,
        events: PropTypes.array,
        history: PropTypes.object,
        inMeeting: PropTypes.bool,
        isConnectedToSpot: PropTypes.bool,
        isWirelessScreenshareConnectionActive: PropTypes.bool,
        remoteControlService: PropTypes.object,
        screensharing: PropTypes.bool,
        videoMuted: PropTypes.bool,
        view: PropTypes.string
    };

    /**
     * Initializes a new {@code RemoteControl} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            events: []
        };

        this._onGoToMeeting = this._onGoToMeeting.bind(this);
    }

    /**
     * Navigates away from the view {@code RemoteControl} when no longer
     * connected to a Spot.
     *
     * @inheritdoc
     */
    componentDidUpdate() {
        if (!this.props.isConnectedToSpot) {
            this.props.dispatch(addNotification('error', 'Disconnected'));
            this.props.history.push('/');
        }
    }

    /**
     * Clean up Spot and connection related state.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this.props.remoteControlService.disconnect();
        this.props.dispatch(setCalendarEvents([]));
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <View
                hideBackground = { true }
                name = 'remoteControl'>
                <div className = { styles.container }>
                    { this._getView() }
                </div>
            </View>
        );
    }

    /**
     * A state machine which determines what content should be displayed
     * within the view.
     *
     * @private
     * @returns {ReactElement}
     */
    _getView() {
        switch (this.props.view) {
        case 'admin':
            return <div>currently in admin tools</div>;
        case 'feedback':
            return <FeedbackForm />;
        case 'home':
            return this._getWaitingForCallView();
        case 'meeting':
            return this._getInCallView();
        case 'setup':
            return <div>currently in setup</div>;
        default:
            return <LoadingIcon color = 'white' />;
        }
    }

    /**
     * Returns the remote control view to display when the Spot instance is in a
     * meeting.
     *
     * @private
     * @returns {ReactElement}
     */
    _getInCallView() {
        const {
            audioMuted,
            inMeeting,
            isWirelessScreenshareConnectionActive,
            screensharing,
            videoMuted
        } = this.props;

        return (
            <RemoteControlMenu
                audioMuted = { audioMuted }
                inMeeting = { inMeeting }
                isWirelessScreenshareConnectionActive
                    = { isWirelessScreenshareConnectionActive }
                screensharing = { screensharing }
                videoMuted = { videoMuted } />
        );
    }

    /**
     * Returns the React Element to display while the Spot instance is not in a
     * meeting.
     *
     * @private
     * @returns {ReactElement}
     */
    _getWaitingForCallView() {
        return (
            <div className = { styles.subcontent }>
                <MeetingNameEntry onSubmit = { this._onGoToMeeting } />
                <div className = { styles.meetings }>
                    <ScheduledMeetings
                        events = { this.props.events }
                        onMeetingClick = { this._onGoToMeeting } />
                </div>
            </div>
        );
    }

    /**
     * Callback invoked when a remote control needs to signal to a Spot to
     * join a specific meeting.
     *
     * @param {string} meetingName - The name of the jitsi meeting to join.
     * @private
     * @returns {void}
     */
    _onGoToMeeting(meetingName) {
        this.props.remoteControlService.goToMeeting(meetingName);
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code RemoteControls}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        ...getInMeetingStatus(state),
        events: getCalendarEvents(state),
        isConnectedToSpot: isConnectedToSpot(state),
        view: getCurrentView(state)
    };
}
export default withRemoteControl(connect(mapStateToProps)(RemoteControl));
