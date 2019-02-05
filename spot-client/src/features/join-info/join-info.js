import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    getCurrentLock,
    getCurrentRoomName,
    getJoinCode,
    isSpot
} from 'reducers';
import { windowHandler } from 'utils';

/**
 * Displays information necessary to input a join code to become a remote
 * control for a Spot.
 *
 * @extends React.Component
 */
class JoinInfo extends React.Component {
    static propTypes = {
        isSpot: PropTypes.bool,
        joinCode: PropTypes.string,
        lock: PropTypes.string,
        roomName: PropTypes.string
    };

    /**
     * Initializes a new {@code JoinInfo} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onOpenRemote = this._onOpenRemote.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const { isSpot: isSpotClient, joinCode } = this.props;

        if (!isSpotClient || !joinCode) {
            return null;
        }

        return (
            <div
                className = 'joinInfo'
                data-qa-id = { 'join-info' }>
                <div onClick = { this._onOpenRemote }>
                    <span>code:</span>
                    <span data-qa-id = 'join-code'>
                        { joinCode }
                    </span>
                </div>
            </div>
        );
    }

    /**
     * Opens an instance of a remote control for the Spot in a new window. This
     * is a debug feature to immediately open the remote without entering a join
     * code.
     *
     * @private
     * @returns {void}
     */
    _onOpenRemote() {
        const baseUrl = windowHandler.getBaseUrl();
        const { roomName: room, lock } = this.props;
        const url = `${baseUrl}#/remote-control?remoteId=${room}&lock=${lock}`;

        windowHandler.openNewWindow(url);
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
        joinCode: getJoinCode(state),
        lock: getCurrentLock(state),
        roomName: getCurrentRoomName(state)
    };
}

export default connect(mapStateToProps)(JoinInfo);
