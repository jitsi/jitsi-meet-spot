import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    getDisplayName,
    getRemoteSpotTVRoomName
} from 'common/app-state';

/**
 * Displays the currently configured Spot-Room name.
 *
 * @extends React.Component
 */
export class RoomName extends React.Component {
    static propTypes = {
        roomName: PropTypes.string
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div className = 'room-name'>
                { this.props.roomName }
            </div>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code RoomName}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        roomName: getRemoteSpotTVRoomName(state) || getDisplayName(state)
    };
}

export default connect(mapStateToProps)(RoomName);
