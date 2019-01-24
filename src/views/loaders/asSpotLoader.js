import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { setLock, setRoomName, setIsSpot } from 'actions';
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
        this.props.dispatch(setIsSpot(true));

        const roomName
            = String(Math.floor(Math.random() * 9999) + 1).padStart(4, 0);

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
        const lock
            = String(Math.floor(Math.random() * 9999) + 1).padStart(4, 0);

        remoteControlService.setLock(lock);

        this.props.dispatch(setLock(lock));
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
