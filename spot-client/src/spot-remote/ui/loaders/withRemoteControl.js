import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { addNotification } from 'common/actions';
import { logger } from 'common/logger';
import {
    getCurrentLock,
    getCurrentRoomName,
    getRemoteControlServerConfig
} from 'common/reducers';
import { remoteControlService } from 'common/remote-control';
import { AbstractLoader, generateWrapper } from 'common/ui';

/**
 * Loads application services while displaying a loading icon. Will display
 * the passed-in children when loading is complete.
 *
 * @extends React.Component
 */
export class RemoteControlLoader extends AbstractLoader {
    static propTypes = {
        ...AbstractLoader.propTypes,
        dispatch: PropTypes.func
    };

    /**
     * Initializes a new {@code RemoteControlLoader} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._reconnecting = false;
        this._reconnectCount = 0;
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
        const { lock, roomName } = this.props;

        if (!lock || !roomName) {
            logger.error(
                `Missing required field for login ${lock} ${roomName}`);

            this._redirectBackToLogin();

            return Promise.reject();
        }

        const connectionConfig = {
            onDisconnect: () => {
                logger.error('Disconnected from the remote control service. '
                    + 'Will attempt reconnect');

                this._reconnect();
            },
            roomName,
            lock,
            serverConfig: this.props.remoteControlConfiguration
        };

        return remoteControlService.connect(connectionConfig)
            .catch(error => {
                logger.error(`Error connecting to remote control service: ${
                    error.toString()}. Will retry.`);

                remoteControlService.disconnect();

                return remoteControlService.connect(connectionConfig)
                    .catch(retryError => {

                        // Retry one time if an error occurs.
                        logger.error('Error retrying connection to remote'
                            + `control service: ${retryError.toString()}`);

                        this.props.dispatch(
                            addNotification('error', 'Something went wrong'));

                        this._redirectBackToLogin();

                        return Promise.reject(retryError);
                    });
            });
    }

    /**
     * Attempts to re-establish a previous connection to the remote control
     * service.
     *
     * @private
     * @returns {void}
     */
    _reconnect() {
        if (this._reconnecting) {
            logger.warn('Reconnect called while already reconnecting');

            return;
        }

        if (this._reconnectCount > 3) {
            logger.warn(`Reconnect limit hit at ${this._reconnectCount}.`);

            this._redirectBackToLogin();

            return;
        }

        this._reconnecting = true;
        this._reconnectCount += 1;

        // wait a little bit to retry to avoid a stampeding herd
        const jitter = Math.floor(Math.random() * 1500) + 500;

        logger.log(`Reconnect attempt number ${this._reconnectCount} in ${
            jitter}ms`);

        this._reconnectTimeout = setTimeout(() => {
            logger.log('Attempting reconnect');

            remoteControlService.disconnect();

            this._loadService()
                .then(() => {
                    logger.log(
                        `Reconnected after ${this.__reconnectCount} tries`);

                    this._reconnecting = false;
                    this._reconnectCount = 0;
                })
                .catch(error => {
                    this._reconnecting = false;

                    logger.error(`Reconnect failed ${error}`);

                    this._reconnect();
                });
        }, jitter);
    }

    /**
     * Changes routes to the join code entry view.
     *
     * @private
     * @returns {void}
     */
    _redirectBackToLogin() {
        this.props.history.push('/');
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code RemoteControlLoader}.
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

const ConnectedRemoteControlLoader
    = withRouter(connect(mapStateToProps)(RemoteControlLoader));

export default generateWrapper(ConnectedRemoteControlLoader);
