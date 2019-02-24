import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { isScreenShareDeviceConnect } from 'common/app-state';
import { getRandomMeetingName } from 'common/utils';

/**
 * A wrapper component for responding to a screenshare input device connecting
 * and redirecting to a meeting with screensharing.
 *
 * @extends React.Component
 */
export class WiredScreenshareRedirector extends React.PureComponent {
    static propTypes = {
        children: PropTypes.any,
        hasScreenshareDevice: PropTypes.bool,
        history: PropTypes.object
    };

    /**
     * Updates the listener for wired screensharing input changes.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (!prevProps.hasScreenshareDevice
            && this.props.hasScreenshareDevice) {
            const meetingName = getRandomMeetingName();

            this.props.history.push(
                `/meeting?location=${meetingName}&screenshare=true`);
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return this.props.children;
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
        hasScreenshareDevice: isScreenShareDeviceConnect(state)
    };
}

export default withRouter(connect(mapStateToProps)(WiredScreenshareRedirector));
