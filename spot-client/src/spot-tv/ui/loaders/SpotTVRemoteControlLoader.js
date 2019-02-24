import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import {
    getCurrentLock,
    getCurrentRoomName,
    getRemoteControlServerConfig,
    setJoinCode,
    setLock,
    setRoomName,
    setIsSpot
} from 'common/app-state';
import { logger } from 'common/logger';
import { remoteControlService } from 'common/remote-control';
import { AbstractLoader } from 'common/ui';

/**
 * Loads application services while displaying a loading icon. Will display
 * the passed-in children when loading is complete.
 *
 * @extends React.Component
 */
export class SpotTVRemoteControlLoader extends AbstractLoader {
    static propTypes = {
        ...AbstractLoader.propTypes,
        dispatch: PropTypes.func
    };

    /**
     * Initializes a new {@code SpotTVRemoteControlLoader} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._isReconnecting = false;
    }

    /**
     * Clears the interval to update the remote control lock.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this._stopLockUpdate();

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
     * Establishes the connection to the remote control service.
     *
     * @override
     */
    _loadService() {
        this.props.dispatch(setIsSpot(true));

        return remoteControlService.connect({
            onDisconnect: () => {
                logger.error('Spot disconnected from the remote control '
                    + 'service. Will attempt reconnect');

                this._stopLockUpdate();

                this._reconnect();
            },
            lock: this.props.lock,
            joinAsSpot: true,
            roomName: this.props.roomName || this._generateRandomString(3),
            serverConfig: this.props.remoteControlConfiguration
        })
            .then(() => {
                logger.log('Spot connected to remote control service');
                this._isReconnecting = false;

                this.props.dispatch(setRoomName(
                    remoteControlService.getRoomName()));

                return this._setLock();
            })
            .then(() => this._startLockUpdate())
            .catch(error => {
                logger.error('Error connecting as spot to remote control '
                    + `remote control service: ${error}`);

                // The case of an incorrect password generally should not
                // happen, but if it does then try to join a new room instead.
                if (error === 'not-authorized') {
                    this.props.dispatch(setRoomName(''));
                    this.props.dispatch(setLock(''));
                }

                this._isReconnecting = false;

                this._reconnect();
            });
    }

    /**
     * Attempts to re-establish a previous connection to the remote control
     * service. Triggers display of a service message while reconnection is in
     * progress.
     *
     * @private
     * @returns {Promise}
     */
    _reconnect() {
        if (this._isReconnecting) {
            logger.warn('Spot reconnect called while already reconnecting');

            return;
        }

        this._isReconnecting = true;

        // wait a little bit to retry to avoid a stampeding herd
        const jitter = Math.floor(Math.random() * 1500) + 500;

        return remoteControlService.disconnect()
            .then(() => {
                this._reconnectTimeout = setTimeout(() => {
                    logger.log('Spot is attempting remote control reconnect');

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

        return remoteControlService.setLock(lock)
            .then(() => {
                logger.log(`New lock set ${lock}`);

                this.props.dispatch(setLock(lock));

                const joinCode = `${this.props.roomName}${lock}`;

                remoteControlService.notifyJoinCodeUpdate(joinCode);

                this.props.dispatch(setJoinCode(joinCode));
            });
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

    /**
     * Helper to stop the loop of changing the MUC password.
     *
     * @private
     * @returns {void}
     */
    _stopLockUpdate() {
        clearInterval(this._lockUpdateInterval);
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code SpotTVRemoteControlLoader}.
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

export default withRouter(connect(mapStateToProps)(SpotTVRemoteControlLoader));
