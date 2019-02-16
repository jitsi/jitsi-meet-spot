import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { setJoinCode, setLock, setRoomName, setIsSpot } from 'common/actions';
import { logger } from 'common/logger';
import {
    getCurrentLock,
    getCurrentRoomName,
    getRemoteControlServerConfig
} from 'common/reducers';
import { remoteControlService } from 'common/remote-control';
import {
    AbstractLoader,
    generateWrapper
} from 'common/ui';
import persistence from '../../../common/utils/persistence';

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
        clearTimeout(this._reconnectTimeout);
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
     * Returns stored reconnection information, if any.
     *
     * @private
     * @returns {Object}
     */
    _getCachedState() {
        const reconnectInformation = persistence.get('spot-reconnect');

        persistence.remove('spot-reconnect');

        if (!reconnectInformation) {
            return {};
        }

        const obj = JSON.parse(reconnectInformation);

        if (Date.now() - obj.timestamp > 30000
            || !obj.roomName
            || !obj.lock) {
            return {};
        }

        return obj;
    }

    /**
     * Establishes the connection to the remote control service.
     *
     * @override
     */
    _loadService() {
        this.props.dispatch(setIsSpot(true));

        const cachedState = this._getCachedState();

        return remoteControlService.connect({
            onDisconnect: () => {
                this._reconnect();
            },
            lock: cachedState.lock,
            joinAsSpot: true,
            roomName: cachedState.roomName || this._generateRandomString(3),
            serverConfig: this.props.remoteControlConfiguration
        })
            .then(() => {
                this.setState({ showReconnecting: false });

                this.props.dispatch(setRoomName(
                    remoteControlService.getRoomName()));
                this._setLock();
                this._startLockUpdate();
            })
            .catch(error => {
                logger.error(error);

                this._reconnect();
            });
    }

    /**
     * Attempts to re-establish a previous connection to the remote control
     * service. Triggers display of a service message while reconnection is in
     * progress.
     *
     * @private
     * @returns {void}
     */
    _reconnect() {
        if (this.state.showReconnecting) {
            return;
        }

        this.setState({
            showReconnecting: true
        }, () => {
            const jitter = Math.floor(Math.random() * 20000) + 1500;

            this._reconnectTimeout = setTimeout(() => {
                const reconnectData = {
                    lock: this.props.lock,
                    roomName: this.props.roomName,
                    timestamp: Date.now()
                };

                persistence.set(
                    'spot-reconnect', JSON.stringify(reconnectData));

                remoteControlService.disconnect();

                this._loadService();
            }, jitter);
        });
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
