import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    addNotification,
    destroyRemoteControlConnection,
    getCalendarEvents,
    getCurrentView,
    isConnectedToSpot,
    setCalendarEvents
} from 'common/app-state';
import { LoadingIcon, View } from 'common/ui';
import { ROUTES } from 'common/routing';

import './../../analytics';
import { NoSleep } from './../../no-sleep';

import { withUltrasound } from './../loaders';
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
        onUnmount: PropTypes.func,
        remoteControlService: PropTypes.object,
        view: PropTypes.string
    };

    /**
     * Redirects to the home view if there is no connection.
     *
     * @inheritdoc
     */
    componentDidMount() {
        if (!this.props.isConnectedToSpot) {
            this.props.history.push(ROUTES.CODE);
        }
    }

    /**
     * Clean up Spot and connection related state.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this.props.onUnmount();
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
 * @param {Object} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        /**
         * Callback to invoke not connected to the remoteControlService.
         *
         * @returns {void}
         */
        onDisconnect() {
            dispatch(addNotification('error', 'Disconnected'));
        },

        /**
         * Resets the known calendar events associated with a Spot-TV and
         * cleans up any existing remote control connections.
         *
         * @returns {void}
         */
        onUnmount() {
            // TODO: clear calendar events as part of the disconnet logic
            // instead of being a separate explicit call.
            dispatch(setCalendarEvents([]));
            dispatch(destroyRemoteControlConnection());
        }
    };
}

export default withUltrasound(
    connect(mapStateToProps, mapDispatchToProps)(RemoteControl));
