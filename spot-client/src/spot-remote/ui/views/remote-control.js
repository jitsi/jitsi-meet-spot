import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    getCalendarEvents,
    getCurrentView,
    isConnectedToSpot
} from 'common/app-state';
import { LoadingIcon, ReconnectOverlay, View } from 'common/ui';

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
        view: PropTypes.string
    };

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
                <ReconnectOverlay />
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
        if (!this.props.isConnectedToSpot) {
            return <div data-qa-id = 'waiting-for-spot-tv'>Waiting for Spot TV to connect...</div>;
        }

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
            return <LoadingIcon />;
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
        view: getCurrentView(state),
        isConnectedToSpot: isConnectedToSpot(state)
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
        }
    };
}

export default withUltrasound(withRemoteControl(
    connect(mapStateToProps, mapDispatchToProps)(RemoteControl)));
