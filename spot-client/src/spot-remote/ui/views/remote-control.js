import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    addNotification,
    getCalendarEvents,
    getCurrentView,
    goToMeeting,
    isConnectedToSpot,
    setCalendarEvents
} from 'common/app-state';
import { LoadingIcon, View } from 'common/ui';

import { NoSleep } from './../../no-sleep';

import { withRemoteControl, withUltrasound } from './../loaders';
import { ElectronDesktopPickerModal } from './../components/electron-desktop-picker';

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
        onClearCalendarEvents: PropTypes.func,
        onDisconnected: PropTypes.func,
        onGoToMeeting: PropTypes.func,
        remoteControlService: PropTypes.object,
        view: PropTypes.string
    };

    /**
     * Navigates away from the view {@code RemoteControl} when no longer
     * connected to a Spot.
     *
     * @inheritdoc
     */
    componentDidUpdate() {
        if (!this.props.isConnectedToSpot) {
            this.props.onDisconnected();
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

        // FIXME: clear calendar events as part of the disconnet logic instead
        // of being a separate explicit call.
        this.props.onClearCalendarEvents();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <NoSleep>
                <View name = 'remoteControl'>
                    { this._getView() }
                    <ElectronDesktopPickerModal />
                </View>
            </NoSleep>
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
                    onGoToMeeting = { this.props.onGoToMeeting } />
            );
        case 'meeting':
            return <InCall remoteControlService = { remoteControlService } />;
        case 'setup':
            return <div>currently in setup</div>;
        default:
            return <LoadingIcon color = 'white' />;
        }
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

/**
 * Creates actions which can update Redux state.
 *
 * @param {Object} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        /**
         * Resets the known calendar events associated with a Spot-TV.
         *
         * @returns {void}
         */
        onClearCalendarEvents() {
            dispatch(setCalendarEvents([]));
        },

        /**
         * Adds a notification that an unexpected disconnect has occurred.
         *
         * @returns {void}
         */
        onDisconnected() {
            dispatch(addNotification('error', 'Disconnected'));
        },

        /**
         * Callback invoked when a remote control needs to signal to a Spot to
         * join a specific meeting.
         *
         * @param {string} meetingName - The name of the jitsi meeting to join.
         * @param {Object} options - Additional details of how to join the
         * meeting.
         * @returns {Promise}
         */
        onGoToMeeting(meetingName, options) {
            return dispatch(goToMeeting(meetingName, options));
        }
    };
}

export default withUltrasound(withRemoteControl(
    connect(mapStateToProps, mapDispatchToProps)(RemoteControl)));
