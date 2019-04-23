import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import {
    addNotification,
    clearSpotTVState,
    getRemoteControlServerConfig,
    setCalendarEvents,
    setSpotTVState
} from 'common/app-state';
import { logger } from 'common/logger';
import {
    SERVICE_UPDATES,
    remoteControlService
} from 'common/remote-control';
import { AbstractLoader, generateWrapper } from 'common/ui';

import { getRoomInfo } from './../../app-state';

/**
 * Presence attributes from Spot-TV to store as booleans in redux.
 *
 * @type {Set}
 */
const presenceToStoreAsBoolean = new Set([
    'audioMuted',
    'screensharing',
    'videoMuted',
    'wiredScreensharingEnabled'
]);

/**
 * Presence attributes from Spot-TV to store as strings in redux.
 *
 * @type {Set}
 */
const presenceToStoreAsString = new Set([
    'inMeeting',
    'joinCode',
    'roomName',
    'screensharingType',
    'spotId',
    'view'
]);

/**
 * Loads application services while displaying a loading icon. Will display
 * the passed-in children when loading is complete.
 *
 * @extends React.Component
 */
export class RemoteControlLoader extends AbstractLoader {
    static propTypes = {
        ...AbstractLoader.propTypes,
        dispatch: PropTypes.func,
        joinCodeServiceUrl: PropTypes.string
    };

    /**
     * Initializes a new {@code RemoteControlLoader} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props, 'SpotRemote');

        this._onDisconnect = this._onDisconnect.bind(this);
        this._onSpotTVStateChange = this._onSpotTVStateChange.bind(this);
    }

    /**
     * Adds a listener for {@code remoteControlService} updates.
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
            SERVICE_UPDATES.SPOT_TV_STATE_CHANGE,
            this._onSpotTVStateChange
        );
    }

    /**
     * Clears the listener for {@code remoteControlService} updates.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        remoteControlService.removeListener(
            SERVICE_UPDATES.UNRECOVERABLE_DISCONNECT,
            this._onDisconnect
        );
        remoteControlService.removeListener(
            SERVICE_UPDATES.SPOT_TV_STATE_CHANGE,
            this._onSpotTVStateChange
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
        const { roomInfo } = this.props;

        if (!roomInfo) {
            logger.error('No `roomInfo` property');

            this._redirectBackToLogin();

            return Promise.reject();
        }

        if (this._unmounted) {
            return Promise.reject();
        }

        return remoteControlService.connect({
            autoReconnect: true,
            roomInfo,
            serverConfig: this.props.remoteControlConfiguration
        })
        .catch(error => {
            // In the wrong password case return back to join code entry.
            if (error === 'not-authorized' || error === 'unrecoverable-error') {
                this.props.dispatch(addNotification('error', 'Something went wrong'));

                this._onDisconnect();

                return Promise.reject();
            }

            return Promise.reject(error);
        });
    }

    /**
     * Callback invoked when {@code remoteControlService} has an update about
     * the current state of a Spot-TV.
     *
     * @param {Object} data - Details of the Spot-TV's current state.
     * @private
     * @returns {void}
     */
    _onSpotTVStateChange(data) {
        const newState = {};
        const { updatedState } = data;

        Object.keys(updatedState).forEach(key => {
            if (presenceToStoreAsBoolean.has(key)) {
                newState[key] = updatedState[key] === 'true';
            } else if (presenceToStoreAsString.has(key)) {
                newState[key] = updatedState[key];
            }
        });

        this.props.dispatch(setSpotTVState(newState));

        if (updatedState.calendar) {
            try {
                const events = JSON.parse(updatedState.calendar);

                this.props.dispatch(setCalendarEvents(events));
            } catch (error) {
                logger.error(
                    'Spot-Remote could not parse calendar events',
                    { error }
                );
            }
        }
    }

    /**
     * Clean up the connection to the remote control service because a disconnect
     * event occurred which cannot be recovered from.
     *
     * @private
     * @returns {void}
     */
    _onDisconnect() {
        logger.error('Spot-Remote could not connect to remote control service');

        this.props.dispatch(clearSpotTVState());

        this._redirectBackToLogin();
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
        roomInfo: getRoomInfo(state),
        remoteControlConfiguration: getRemoteControlServerConfig(state)
    };
}

const ConnectedRemoteControlLoader
    = withRouter(connect(mapStateToProps)(RemoteControlLoader));

export default generateWrapper(ConnectedRemoteControlLoader);
