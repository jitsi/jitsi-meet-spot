import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { getCurrentLock, getCurrentRoomName } from 'reducers';
import { remoteControlService } from 'remote-control';
import { logger } from 'utils';

import { AbstractLoader, generateWrapper } from './abstract-loader';

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
     * Returns the name of the muc to join. The name is taken from the query
     * params, if set, or taken from the jid created by the remote control
     * service during initialization.
     *
     * @private
     * @returns {string}
     */
    _getRoomName() {
        if (this.props.roomName) {
            return this.props.roomName;
        }

        const queryParams = new URLSearchParams(this.props.location.search);
        const remoteId = queryParams.get('remoteId');

        return remoteId ? decodeURIComponent(remoteId) : undefined;
    }

    /**
     * Returns the lock code for the room to be joined, if any.
     *
     * @private
     * @returns {string}
     */
    _getRoomLock() {
        if (this.props.lock) {
            return this.props.lock;
        }

        const queryParams = new URLSearchParams(this.props.location.search);
        const lock = queryParams.get('lock');

        return lock ? decodeURIComponent(lock) : undefined;
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
        const roomName = this._getRoomName();
        const roomLock = this._getRoomLock();

        if (!roomName || !roomLock) {
            this.props.history.push('/');

            return Promise.reject();
        }

        return remoteControlService.connect(
            this._getRoomName(),
            this._getRoomLock())
            .catch(error => logger.error(error));
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
        roomName: getCurrentRoomName(state)
    };
}

const ConnectedRemoteControlLoader
    = withRouter(connect(mapStateToProps)(RemoteControlLoader));

export default generateWrapper(ConnectedRemoteControlLoader);
