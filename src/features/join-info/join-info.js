import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    getCurrentLock,
    getCurrentRoomName,
    isSpot
} from 'reducers';

import styles from './styles.css';

/**
 * Displays information necessary to input a join code to become a remote
 * control for a Spot.
 *
 * @extends React.Component
 */
class JoinInfo extends React.Component {
    static propTypes = {
        isSpot: PropTypes.bool,
        lock: PropTypes.string,
        roomName: PropTypes.string
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const { isSpot: isSpotClient, lock, roomName } = this.props;

        if (!isSpotClient || !lock || !roomName) {
            return null;
        }

        return (
            <div
                className = { styles.joinInfo }
                data-qa-id = { 'join-info' }>
                <div>
                    <span>code:</span>
                    <span data-qa-id = 'join-code'>
                        { `${roomName.toUpperCase()}${lock.toUpperCase()}` }
                    </span>
                </div>
            </div>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code JoinInfo}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        isSpot: isSpot(state),
        lock: getCurrentLock(state),
        roomName: getCurrentRoomName(state)
    };
}

export default connect(mapStateToProps)(JoinInfo);
