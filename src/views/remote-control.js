import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { LoadingIcon } from 'features/loading-icon';
import { MeetingNameEntry } from 'features/meeting-name-entry';
import { FeedbackForm, RemoteControlMenu } from 'features/remote-control-menu';
import { ScheduledMeetings } from 'features/scheduled-meetings';
import { remoteControlService } from 'remote-control';
import { getLocalRemoteControlId } from 'reducers';

import View from './view';
import styles from './view.css';

/**
 * Displays the remote control view for controlling the application from another
 * browser window.
 *
 * @extends React.Component
 */
export class RemoteControl extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        localRemoteControlId: PropTypes.string,
        match: PropTypes.object
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
            events: [],
            view: ''
        };

        this._onCommand = this._onCommand.bind(this);
        this._onGoToMeeting = this._onGoToMeeting.bind(this);
        this._onPresence = this._onPresence.bind(this);
    }

    /**
     * Connects to the remote control service so it can send commands back to
     * the main application instance and starts listening for application state
     * updates.
     *
     * @inheritdoc
     */
    componentDidMount() {
        remoteControlService.init(this.props.dispatch)
            .then(() => {
                remoteControlService.addCommandListener(this._onCommand);

                remoteControlService.sendCommand(
                    this._getRemoteId(),
                    'requestCalendar',
                    { requester: this.props.localRemoteControlId }
                );

                remoteControlService.createMuc(this._getRemoteNode());

                remoteControlService.joinMuc();

                remoteControlService.addPresenceListener(this._onPresence);
            });
    }

    /**
     * Cleans up listeners waiting for application state updates.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        remoteControlService.removeCommandListener(this._onCommand);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <View name = 'remoteControl'>
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
        switch (this.state.view) {
        case 'admin':
            return <div>currently in admin tools</div>;
        case 'calendar':
            return this._getWaitingForCallView();
        case 'feedback':
            return <FeedbackForm remoteId = { this._getRemoteId() } />;
        case 'meeting':
            return this._getInCallView();
        case 'setup':
            return <div>currently in setup</div>;
        default:
            return <LoadingIcon color = 'white' />;
        }
    }

    /**
     * Returns the React Element for submitting conference feedback.
     *
     * @private
     * @returns {ReactElement}
     */
    _getFeedbackView() {
        return <FeedbackForm remoteId = { this._getRemoteId() } />;
    }

    /**
     * Parses the id of the main application given by
     * {@code remoteControlService} and returns only the unique id, without any
     * domain information.
     */
    _getRemoteNode() {
        return this._getRemoteId().split('@')[0];
    }

    /**
     * Parses url params to get the id assigned to the main application and used
     * for communicating back to the main application.
     */
    _getRemoteId() {
        return decodeURIComponent(this.props.match.params.remoteId);
    }

    /**
     * Returns the remote control view to display when the main application is
     * in a conference.
     *
     * @private
     * @returns {ReactElement}
     */
    _getInCallView() {
        return (
            <RemoteControlMenu
                remoteId = { this._getRemoteId() }
                audioMuted = { this.state.audioMuted === 'true' }
                videoMuted = { this.state.videoMuted === 'true' } />
        );
    }

    /**
     * Returns the React Element to display while the main application is not
     * in a conference.
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
                        events = { this.state.events }
                        onMeetingClick = { this._onGoToMeeting } />
                </div>
            </div>
        );
    }

    /**
     * Callback to parse direct updates received from the main application.
     *
     * @param {string} command - The type of command received.
     * @param {Object} options - Additional information passed with the command.
     * @private
     * @returns {void}
     */
    _onCommand(command, options) {
        if (command === 'calendarData') {
            this.setState({
                events: options.events
            });
        }
    }

    /**
     * Callback invoked when the remote control needs to signal to the main
     * application that it should join a specific meeting.
     *
     * @param {string} meetingName - The name of the jitsi conference to join.
     * @private
     * @returns {void}
     */
    _onGoToMeeting(meetingName) {
        remoteControlService.sendCommand(
            this._getRemoteId(), 'goToMeeting', { meetingName });
    }

    /**
     * Callback invoked when an application has published a status update
     * through the remoteControlService.
     *
     * @param {Object} data - The status update broadcasted by an application
     * connected to {@code remoteControlService}.
     * @param {String} from - The id of the application that broadcasted the
     * update.
     * @private
     * @returns {void}
     */
    _onPresence(data, from) {
        if (this._getRemoteId().indexOf(from) !== 0) {
            return;
        }

        switch (data.tagName) {
        case 'view':
            this.setState({ view: data.value });
            break;

        case 'audioMuted':
            this.setState({ audioMuted: data.value });
            break;

        case 'videoMuted':
            this.setState({ videoMuted: data.value });
            break;
        }
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code RemoteControl}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        localRemoteControlId: getLocalRemoteControlId(state)
    };
}

export default connect(mapStateToProps)(RemoteControl);
