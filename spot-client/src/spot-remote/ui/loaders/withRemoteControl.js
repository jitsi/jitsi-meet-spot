import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import {
    addNotification,
    clearSpotTVState,
    getJoinCode,
    getRemoteControlServerConfig,
    setCalendarEvents,
    getSpotServicesConfig,
    setSpotTVState
} from 'common/app-state';
import { logger } from 'common/logger';
import { CONNECTION_EVENTS, remoteControlService } from 'common/remote-control';
import { AbstractLoader, generateWrapper } from 'common/ui';

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
        super(props, 'SpotRemote', /* supports reconnects */ true);
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
        const { joinCode } = this.props;

        if (!joinCode) {
            logger.error('Missing join code');

            this._redirectBackToLogin();

            return Promise.reject();
        }

        if (this._unmounted) {
            return Promise.reject();
        }

        return remoteControlService.connect({
            joinCode,

            /**
             * Callback invoked when an unexpected disconnect happens with the
             * remote control service connection. May trigger retrying to
             * establish the connection.
             *
             * @param {string} reason - A constant which provides an explanation
             * for the disconnect.
             * @private
             * @returns {void}
             */
            onDisconnect: reason => {
                if (reason === CONNECTION_EVENTS.SPOT_TV_DISCONNECTED) {
                    logger.error('Disconnected due to Spot-TV leaving');
                    this.props.dispatch(clearSpotTVState());
                } else {
                    logger.error(
                        'Spot-Remove disconnected from remote control service',
                        { reason }
                    );

                    this._reconnect();
                }
            },

            /**
             * Callback invoked to update redux about a new Spot-TV state.
             *
             * @param {Object} updatedState - The new Spot-TV status.
             * @private
             * @returns {void}
             */
            onSpotUpdate: updatedState => {
                const newState = {};

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
            },

            joinCodeServiceUrl: this.props.joinCodeServiceUrl,
            serverConfig: this.props.remoteControlConfiguration
        })
        .catch(error => {
            // In the wrong password case return back to join code entry.
            if (error === 'not-authorized') {
                logger.error(
                    'Spot-Remote could not connect to remote control service',
                    { error }
                );

                this.props.dispatch(
                    addNotification('error', 'Something went wrong'));

                this._redirectBackToLogin();

                return Promise.reject();
            }

            // This will trigger reconnect
            throw error;
        });
    }

    /**
     * Disconnects the remote control service.
     *
     * @returns {Promise}
     */
    _stopService() {
        return remoteControlService.disconnect();
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
    const { joinCodeServiceUrl } = getSpotServicesConfig(state);

    return {
        joinCode: getJoinCode(state),
        joinCodeServiceUrl,
        remoteControlConfiguration: getRemoteControlServerConfig(state)
    };
}

const ConnectedRemoteControlLoader
    = withRouter(connect(mapStateToProps)(RemoteControlLoader));

export default generateWrapper(ConnectedRemoteControlLoader);
