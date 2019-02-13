import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { addNotification, setCalendarEvents } from 'common/actions';
import {
    getCalendarEvents,
    getCurrentView,
    isConnectedToSpot
} from 'common/reducers';
import { LoadingIcon, View } from 'common/ui';

import { withRemoteControl, withUltrasound } from './../loaders';

import { Feedback, InCall, WaitingForCall } from './remote-views';

/**
 * Displays the remote control view for controlling a Spot instance from another
 * browser window.
 *
 * @extends React.PureComponent
 */
export class RemoteControl extends React.PureComponent {
    static propTypes = {
        dispatch: PropTypes.func,
        events: PropTypes.array,
        history: PropTypes.object,
        isConnectedToSpot: PropTypes.bool,
        remoteControlService: PropTypes.object,
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
            <View name = 'remoteControl'>
                { this._getView() }
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
        const { remoteControlService, view } = this.props;

        switch (view) {
        case 'admin':
            return <div>currently in admin tools</div>;
        case 'feedback':
            return (
                <Feedback
                    remoteControlService = { remoteControlService } />
            );
        case 'home':
            return (
                <WaitingForCall
                    events = { this.props.events }
                    onGoToMeeting = { this._onGoToMeeting } />
            );
        case 'meeting':
            return <InCall remoteControlService = { remoteControlService } />;
        case 'setup':
            return <div>currently in setup</div>;
        default:
            return <LoadingIcon color = 'white' />;
        }
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
        events: getCalendarEvents(state),
        isConnectedToSpot: isConnectedToSpot(state),
        view: getCurrentView(state)
    };
}
export default withUltrasound(withRemoteControl(
    connect(mapStateToProps)(RemoteControl)));
