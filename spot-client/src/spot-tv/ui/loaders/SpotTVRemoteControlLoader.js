import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { analytics } from 'common/analytics';
import {
    getJoinCode,
    getJoinCodeRefreshRate,
    getRemoteControlServerConfig,
    getSpotServicesConfig,
    setJoinCode,
    setJwt,
    setIsSpot
} from 'common/app-state';
import { registerDevice } from 'common/backend';
import { logger } from 'common/logger';
import { SERVICE_UPDATES, remoteControlService } from 'common/remote-control';
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
        super(props, 'SpotTV');

        this._onDisconnect = this._onDisconnect.bind(this);
        this._onJoinCodeChange = this._onJoinCodeChange.bind(this);
    }

    /**
     * Configures analytics to report events as a Spot-TV.
     *
     * @inheritdoc
     */
    componentDidMount() {
        super.componentDidMount();

        remoteControlService.addListener(
            SERVICE_UPDATES.UNRECOVERABLE_DISCONNECT,
            this._onDisconnect
        );
        remoteControlService.addListener(
            SERVICE_UPDATES.JOIN_CODE_CHANGE,
            this._onJoinCodeChange
        );

        analytics.updateProperty('spot-tv', true);
    }

    /**
     * Clears the interval to update the remote control lock.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        remoteControlService.removeListener(
            SERVICE_UPDATES.UNRECOVERABLE_DISCONNECT,
            this._onDisconnect
        );
        remoteControlService.removeListener(
            SERVICE_UPDATES.JOIN_CODE_CHANGE,
            this._onJoinCodeChange
        );
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
            getJoinCodePromise
                = registerDevice(adminServiceUrl)
                    .then(json => {
                        const { joinCode, jwt } = json;

                        // Clear it if the jwt is empty
                        this.props.dispatch(setJwt(jwt));

                        return joinCode;
                    });
        } else {
            getJoinCodePromise = Promise.resolve(_joinCode);
        }

        return getJoinCodePromise.then(
            joinCode => {
                logger.log(`Will use ${joinCode} code to setup the Spot TV`);
                this.props.dispatch(setJoinCode(joinCode));

                return remoteControlService.connect({
                    autoReconnect: true,
                    joinAsSpot: true,
                    joinCode,

                    // FIXME join code refresh is disabled with the backend as the first step,
                    // because there's no password set on the room and the JWT is used instead.
                    joinCodeRefreshRate: !adminServiceUrl && this.props.joinCodeRefreshRate,
                    joinCodeServiceUrl: this.props.joinCodeServiceUrl,
                    serverConfig: this.props.remoteControlConfiguration
                });
            });
    }

    /**
     * Callback invoked when {@code remoteControlService} has been disconnected
     * from an unrecoverable error. Tries to reconnect.
     *
     * @param {string} eventName - The event triggered.
     * @private
     * @returns {void}
     */
    _onDisconnect() {
        logger.error(
            'Spot-TV disconnected from the remote control service.');
        remoteControlService.disconnect();
        this.props.dispatch(setJoinCode(''));

        this._loadService();
    }

    /**
     * Callback invoked when {@code remoteControlService} has changes the join
     * code necessary to pair with the Spot-TV.
     *
     * @param {Object} data - An object containing the update.
     * @private
     * @returns {void}
     */
    _onJoinCodeChange(data) {
        this.props.dispatch(setJoinCode(data.joinCode));
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
