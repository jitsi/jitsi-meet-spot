import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    addNotification,
    getCalendarEvents,
    getCurrentView,
    isConnectedToSpot,
    setCalendarEvents
} from 'common/app-state';
import { LoadingIcon, View } from 'common/ui';

import './../../analytics';
import { NoSleep } from './../../no-sleep';

import { withRemoteControl, withUltrasound } from './../loaders';
import { ElectronDesktopPickerModal } from './../components/electron-desktop-picker';

import { Feedback, InCall, WaitingForCall } from './remote-views';

/**
 * Displays the remote control view for controlling a Spot-TV instance from am
 * instance of Spot-Remote. This view has sub-views for interactiog with
 * Spot-TV in its different states.
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
        remoteControlService: PropTypes.object,
        view: PropTypes.string
    };

    /**
     * Navigates away from the view {@code RemoteControl} when no longer
     * connected to a Spot-TV.
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
     * Clean up connection related state.
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
                <Feedback />
            );
        case 'home':
            return <WaitingForCall events = { this.props.events } />;
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
 * @param {Function} dispatch - The Redux dispatch function to update state.
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
        }
    };
}

export default withUltrasound(withRemoteControl(
    connect(mapStateToProps, mapDispatchToProps)(RemoteControl)));
