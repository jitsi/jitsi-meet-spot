import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { setJoinCode, setLock, setRoomName, setIsSpot } from 'actions';
import {
    getCurrentLock,
    getCurrentRoomName,
    getRemoteControlServerConfig
} from 'reducers';
import { remoteControlService } from 'remote-control';
import { logger } from 'utils';

import { AbstractLoader, generateWrapper } from './abstract-loader';

/**
 * Loads application services while displaying a loading icon. Will display
 * the passed-in children when loading is complete.
 *
 * @extends React.Component
 */
export class AsSpotLoader extends AbstractLoader {
    static propTypes = {
        ...AbstractLoader.propTypes,
        dispatch: PropTypes.func
    };

    /**
     * Clears the interval to update the remote control lock.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        clearInterval(this._lockUpdateInterval);
    }

    /**
     * Temporary method to generate a random string, intended to be used to
     * create a random join code.
     *
     * @param {number} length - The desired length of the random string.
     * @returns {string}
     */
    _generateRandomString(length) {
        return Math.random()
            .toString(36)
            .substr(2, length);
    }

    /**
     * Returns the props that should be passed into this loader's child
     * elements.
     *
     * @override
     */
    _getPropsForChildren() {
        return {
            remoteControlService
        };
    }

    /**
     * Establishes the connection to the remote control service.
     *
     * @override
     */
    _loadService() {
        this._generateRandomString(3);
        this.props.dispatch(setIsSpot(true));

        const roomName = this._generateRandomString(3);

        return remoteControlService.connect({
            joinAsSpot: true,
            roomName,
            serverConfig: this.props.remoteControlConfiguration
        })
            .then(() => {
                this.props.dispatch(setRoomName(
                    remoteControlService.getRoomName()));
                this._setLock();
                this._startLockUpdate();
            })
            .catch(error => logger.error(error));
    }

    /**
     * Places a new password on the current remote control connection.
     *
     * @private
     * @returns {void}
     */
    _setLock() {
        const lock = this._generateRandomString(3);

        remoteControlService.setLock(lock);

        this.props.dispatch(setLock(lock));

        const joinCode = `${this.props.roomName}${lock}`;

        remoteControlService.notifyJoinCodeUpdate(joinCode);
        this.props.dispatch(setJoinCode(joinCode));
    }

    /**
     * Starts an update loop to change the password of the current remote
     * control connection.
     *
     * @private
     * @returns {void}
     */
    _startLockUpdate() {
        this._lockUpdateInterval = setInterval(() => {
            this._setLock();
        }, 300000);
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code AsSpotLoader}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        lock: getCurrentLock(state),
        remoteControlConfiguration: getRemoteControlServerConfig(state),
        roomName: getCurrentRoomName(state)
    };
}

const ConnectedAsSpotLoader
    = withRouter(connect(mapStateToProps)(AsSpotLoader));

export default generateWrapper(ConnectedAsSpotLoader);
