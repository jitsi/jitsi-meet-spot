import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import {
    addNotification,
    isConnectedToSpot
} from 'common/app-state';
import { history } from 'common/history';
import { logger } from 'common/logger';
import { remoteControlClient } from 'common/remote-control';
import { ROUTES } from 'common/routing';
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
        isConnectedToSpot: PropTypes.bool,
        onUnexpectedDisconnected: PropTypes.func
    };

    /**
     * Initializes a new {@code RemoteControlLoader} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props, 'SpotRemote');
    }

    /**
     * Navigates away from the view {@code RemoteControl} when no longer
     * connected to a Spot-TV.
     *
     * @inheritdoc
     */
    componentDidUpdate() {
        if (!this.props.isConnectedToSpot) {
            this.props.onUnexpectedDisconnected();
        }
    }

    /**
     * Returns the props that should be passed into this loader's child
     * elements.
     *
     * @override
     */
    _getPropsForChildren() {
        return {
            remoteControlClient
        };
    }

    /**
     * Establishes the connection to the remote control service.
     *
     * @override
     */
    _loadService() {
        const connectPromise = remoteControlClient.getConnectPromise();

        if (connectPromise) {
            return connectPromise;
        }

        // Redirect to the join code entry page
        history.push(ROUTES.CODE);

        return Promise.reject('The connection must be started by the join code entry page');
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code RemoteControls}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        isConnectedToSpot: isConnectedToSpot(state)
    };
}

/**
 * Creates actions which can update Redux state.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        /**
         * Adds a notification that an unexpected disconnect has occurred.
         *
         * @returns {void}
         */
        onUnexpectedDisconnected() {
            logger.log('onUnexpectedDisconnect');
            dispatch(addNotification('error', 'Disconnected'));
            history.push(ROUTES.CODE);
        }
    };
}

const ConnectedRemoteControlLoader = withRouter(connect(mapStateToProps, mapDispatchToProps)(RemoteControlLoader));

export default generateWrapper(ConnectedRemoteControlLoader);
