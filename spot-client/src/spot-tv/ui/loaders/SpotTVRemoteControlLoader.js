import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import {
    getJoinCode,
    getJoinCodeRefreshRate,
    getRemoteControlServerConfig,
    getSpotServicesConfig,
    setJoinCode,
    setIsSpot
} from 'common/app-state';
import { fetchJoinCode } from 'common/backend';
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
        adminServiceUrl: PropTypes.string,
        dispatch: PropTypes.func,
        joinCodeRefreshRate: PropTypes.number,
        joinCodeServiceUrl: PropTypes.string
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
        this._stopJoinCodeUpdateInterval();

        clearTimeout(this._reconnectTimeout);
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
        const {
            adminServiceUrl,
            dispatch,
            joinCode: _joinCode
        } = this.props;

        dispatch(setIsSpot(true));

        let getJoinCodePromise;

        if (adminServiceUrl) {
            logger.log(`Will use ${adminServiceUrl} to get the join code`);
            getJoinCodePromise = fetchJoinCode(adminServiceUrl);
        } else {
            getJoinCodePromise = Promise.resolve(_joinCode);
        }

        return getJoinCodePromise.then(
            joinCode => {
                logger.log(`Will use ${joinCode} code to setup the Spot TV`);
                this.props.dispatch(setJoinCode(joinCode));

                return remoteControlService.connect({
                    onDisconnect: () => {
                        logger.error('Spot-TV disconnected from the remote control service.');

                        this._stopJoinCodeUpdateInterval();

                        this._reconnect();
                    },
                    joinAsSpot: true,
                    joinCode,
                    joinCodeServiceUrl: this.props.joinCodeServiceUrl,
                    serverConfig: this.props.remoteControlConfiguration
                });
            })
            .then(() => {
                logger.log('Spot-TV connected to remote control service');
                this._isReconnecting = false;

                if (adminServiceUrl) {
                    // FIXME join code refresh is disabled with the backend as the first step,
                    // because there's no password set on the room and the JWT is used instead.
                    return Promise.resolve();
                }

                return this._refreshJoinCode()
                        .then(() => this._startJoinCodeUpdateInterval());
            })
            .catch(error => {
                logger.error(
                    'Error connecting as Spot-TV to remote control service',
                    { error }
                );

                // The case of an incorrect password generally should not
                // happen, but if it does then try to join a new room instead.
                if (error === 'not-authorized') {
                    this.props.dispatch(setJoinCode(''));
                }

                this._isReconnecting = false;

                this._reconnect();

                // Do not mark the component as loaded
                throw error;
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
            logger.warn('Spot-TV reconnect called while already reconnecting');

            return;
        }

        this._isReconnecting = true;
        this.setState({ loaded: false });

        // wait a little bit to retry to avoid a stampeding herd
        const jitter = Math.floor(Math.random() * 1500) + 500;

        return remoteControlService.disconnect()
            .then(() => {
                this._reconnectTimeout = setTimeout(() => {
                    logger.log('Spot-TV attempting reconnect');

                    this._loadService()
                        .then(() => {
                            this.setState({ loaded: true });
                        })
                        .catch(() => {
                            // FIXME this swallows the error as it's logged and handled
                            // the in _loadService. The plan is to remove when refactoring for
                            // loader component with reconnects.
                        });
                }, jitter);
            });
    }

    /**
     * Places a new join code for Spot-Remotes to connect to Spot-TV.
     *
     * @private
     * @returns {void}
     */
    _refreshJoinCode() {
        return remoteControlService.refreshJoinCode()
            .then(joinCode => this.props.dispatch(setJoinCode(joinCode)));
    }

    /**
     * Starts an update loop to change the password of the current remote
     * control connection.
     *
     * @private
     * @returns {void}
     */
    _startJoinCodeUpdateInterval() {
        this._joinCodeUpdateInterval = setInterval(() => {
            this._refreshJoinCode();
        }, this.props.joinCodeRefreshRate);
    }

    /**
     * Helper to stop the loop of changing the MUC password.
     *
     * @private
     * @returns {void}
     */
    _stopJoinCodeUpdateInterval() {
        clearInterval(this._joinCodeUpdateInterval);
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
    const {
        adminServiceUrl,
        joinCodeServiceUrl
    } = getSpotServicesConfig(state);

    return {
        adminServiceUrl,
        joinCode: getJoinCode(state),
        joinCodeRefreshRate: getJoinCodeRefreshRate(state),
        joinCodeServiceUrl,
        remoteControlConfiguration: getRemoteControlServerConfig(state)
    };
}

export default withRouter(connect(mapStateToProps)(SpotTVRemoteControlLoader));
