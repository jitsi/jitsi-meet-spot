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

        return remoteControlService.connect({
            onDisconnect: () => {
                logger.error('Disconnected from the remote control service');

                this.props.dispatch(
                    addNotification('error', 'A connection error occurred'));

                this._redirectBackToLogin();
            },
            roomName,
            lock,
            serverConfig: this.props.remoteControlConfiguration
        }).catch(error => {
            logger.error(`Error connecting to remote control service: ${
                error.toString()}`);

            this.props.dispatch(
                addNotification('error', 'Something went wrong'));

            remoteControlService.disconnect();

            this._redirectBackToLogin();
        });
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
