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
        super(props, 'SpotTV', /* supports reconnects */ true);

        this._onServiceEvent = this._onServiceEvent.bind(this);
    }

    /**
     * Configures analytics to report events as a Spot-TV.
     *
     * @inheritdoc
     */
    componentDidMount() {
        remoteControlService.addEventListener(this._onServiceEvent);
        super.componentDidMount();

        analytics.updateProperty('spot-tv', true);
    }

    /**
     * Clears the interval to update the remote control lock.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        remoteControlService.removeEventListener(this._onServiceEvent);

        super.componentWillUnmount();
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
                    joinAsSpot: true,
                    joinCode,

                    // FIXME join code refresh is disabled with the backend as the first step,
                    // because there's no password set on the room and the JWT is used instead.
                    joinCodeRefreshRate: !adminServiceUrl && this.props.joinCodeRefreshRate,
                    joinCodeServiceUrl: this.props.joinCodeServiceUrl,
                    serverConfig: this.props.remoteControlConfiguration
                });
            })
            .catch(error => {
                // The case of an incorrect password generally should not
                // happen, but if it does then try to join a new room instead.
                if (error === 'not-authorized') {
                    this.props.dispatch(setJoinCode(''));
                }

                // Let the parent component handle reconnects
                throw error;
            });
    }

    /**
     * Callback invoked when {@code remoteControlService} has an update.
     *
     * @param {string} eventName - The event triggered.
     * @param {Object} data - Additional information about the event.
     * @private
     * @returns {void}
     */
    _onServiceEvent(eventName, data) {
        switch (eventName) {
        case SERVICE_UPDATES.DISCONNECT:
            logger.error(
                'Spot-TV disconnected from the remote control service.');

            this._reconnect();
            break;

        case SERVICE_UPDATES.JOIN_CODE_CHANGE:
            this.props.dispatch(setJoinCode(data.joinCode));

            break;
        }
    }

    /**
     * Disconnects the remote control service.
     *
     * @returns {*}
     * @private
     */
    _stopService() {
        return remoteControlService.disconnect();
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
