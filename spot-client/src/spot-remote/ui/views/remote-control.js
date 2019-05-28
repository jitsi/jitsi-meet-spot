import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    addNotification,
    getCalendarEvents,
    getCurrentView,
    isConnectedToSpot
} from 'common/app-state';
import { LoadingIcon, View } from 'common/ui';

import './../../analytics';

import { disconnectFromSpotTV } from './../../app-state';
import { withRemoteControl, withUltrasound } from './../loaders';
import { ElectronDesktopPickerModal } from './../components/electron-desktop-picker';

import { Feedback, InCall, WaitingForCall } from './remote-views';

/**
 * Displays the remote control view for controlling a Spot-TV instance from an
 * instance of Spot-Remote. This view has sub-views for interacting with
 * Spot-TV in its different states.
 *
 * @extends React.PureComponent
 */
export class RemoteControl extends React.PureComponent {
    static propTypes = {
        events: PropTypes.array,
        history: PropTypes.object,
        isConnectedToSpot: PropTypes.bool,
        onDisconnect: PropTypes.func,
        onUnexpectedDisconnected: PropTypes.func,
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
            this.props.onUnexpectedDisconnected();
            this.props.history.push('/');
        }
    }

    /**
     * Clean up connection related state.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this.props.onDisconnect();
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
                <ElectronDesktopPickerModal />
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
            return (
                <Feedback />
            );
        case 'home':
            return <WaitingForCall events = { this.props.events } />;
        case 'meeting':
            return <InCall />;
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
         * Stop any existing connection to a Spot-TV.
         *
         * @returns {void}
         */
        onDisconnect() {
            dispatch(disconnectFromSpotTV());
        },

        /**
         * Adds a notification that an unexpected disconnect has occurred.
         *
         * @returns {void}
         */
        onUnexpectedDisconnected() {
            dispatch(addNotification('error', 'Disconnected'));
        }
    };
}

export default withUltrasound(withRemoteControl(
    connect(mapStateToProps, mapDispatchToProps)(RemoteControl)));
