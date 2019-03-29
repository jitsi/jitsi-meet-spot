import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import {
    getJoinCode,
    getJoinCodeRefreshRate,
    getRemoteControlServerConfig,
    setJoinCode,
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
        dispatch: PropTypes.func,
        joinCodeRefreshRate: PropTypes.number
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
        const { dispatch, joinCode } = this.props;

        dispatch(setIsSpot(true));

        // FIXME: There is no proper join code service so the code is a
        // combination of a 3 digit room name and a 3 digit room password.
        return remoteControlService.connect({
            onDisconnect: () => {
                logger.error(
                    'Spot-TV disconnected from the remote control service.');

                this._stopJoinCodeUpdateInterval();

                this._reconnect();
            },
            joinAsSpot: true,
            joinCode,
            serverConfig: this.props.remoteControlConfiguration
        })
            .then(() => {
                logger.log('Spot-TV connected to remote control service');
                this._isReconnecting = false;

                return this._refreshJoinCode();
            })
            .then(() => this._startJoinCodeUpdateInterval())
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

        // wait a little bit to retry to avoid a stampeding herd
        const jitter = Math.floor(Math.random() * 1500) + 500;

        return remoteControlService.disconnect()
            .then(() => {
                this._reconnectTimeout = setTimeout(() => {
                    logger.log('Spot-TV attempting reconnect');

                    this._loadService();
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
            .then(joinCode => {
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
    return {
        joinCode: getJoinCode(state),
        joinCodeRefreshRate: getJoinCodeRefreshRate(state),
        remoteControlConfiguration: getRemoteControlServerConfig(state)
    };
}

export default withRouter(connect(mapStateToProps)(SpotTVRemoteControlLoader));
