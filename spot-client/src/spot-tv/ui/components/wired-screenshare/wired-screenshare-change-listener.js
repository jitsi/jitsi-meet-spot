import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { isDeviceConnectedForWiredScreensharing } from 'common/app-state';

/**
 * A wrapper component for responding to a screenshare input device connecting
 * and redirecting to a meeting with screensharing.
 *
 * @extends React.Component
 */
export class WiredScreenshareChangeListener extends React.PureComponent {
    static propTypes = {
        children: PropTypes.any,
        hasScreenshareDevice: PropTypes.bool,
        history: PropTypes.object,
        onDeviceConnected: PropTypes.func,
        onDeviceDisconnected: PropTypes.func
    };

    /**
     * Updates the listener for wired screensharing input changes.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (!prevProps.hasScreenshareDevice
            && this.props.hasScreenshareDevice
            && this.props.onDeviceConnected) {
            this.props.onDeviceConnected();
        }

        if (prevProps.hasScreenshareDevice
            && !this.props.hasScreenshareDevice
            && this.props.onDeviceDisconnected) {
            this.props.onDeviceDisconnected();
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return this.props.children || null;
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code WiredScreenshareRedirector}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        hasScreenshareDevice: isDeviceConnectedForWiredScreensharing(state)
    };
}

export default withRouter(
    connect(mapStateToProps)(WiredScreenshareChangeListener));
