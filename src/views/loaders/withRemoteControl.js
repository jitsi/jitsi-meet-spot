import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { setLocalRemoteControlID, setLock } from 'actions';
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
     * Clears the interval to update the remote control lock.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        clearInterval(this._lockUpdateInterval);
    }

    /**
     * Returns the name of the muc to join. The name is taken from the query
     * params, if set, or taken from the jid created by the remote control
     * service during initialization.
     *
     * @private
     * @returns {string}
     */
    _getRoomName() {
        const remoteIdParam = this.props.match
            && this.props.match.params
            && this.props.match.params.remoteId;
        const remoteId = remoteIdParam && decodeURIComponent(remoteIdParam);

        return remoteId && remoteId.split('@')[0];
    }

    /**
     * Returns the lock code for the room to be joined, if any.
     *
     * @private
     * @returns {string}
     */
    _getRoomLock() {
        const queryParams = new URLSearchParams(this.props.location.search);
        const lock = queryParams.get('lock');

        return lock && decodeURIComponent(lock);
    }

    /**
     * @override
     */
    _getPropsForChildren() {
        return {
            remoteControlService
        };
    }

    /**
     * @override
     */
    _loadService() {
        return remoteControlService.init(
            this._getRoomName(),
            this._getRoomLock())
            .then(() => {
                const roomFullJid = remoteControlService.getRoomFullJid();

                this.props.dispatch(setLocalRemoteControlID(roomFullJid));

                if (!this._getRoomName()) {
                    this._setLock();
                    this._startLockUpdate();
                }
            })
            .catch(error => logger.error(error));
    }

    /**
     * Places a new password on the current remote control connection.
     *
     * @private
     * @returns {void}
     */
    _setLock() {
        const currentTime = `${Date.now()}`;
        const lock = currentTime.substring(
            currentTime.length - 4, currentTime.length);

        remoteControlService.setLock(currentTime.substring(
            currentTime.length - 4, currentTime.length));

        this.props.dispatch(setLock(lock));
    }

    /**
     * Starts an update loop to change the password of the current remote
     * control connection.
     *
     * @private
     * @returns {void}
     */
    _startLockUpdate() {
        this._lockUpdateInterval = setInterval(() => {
            this._setLock();
        }, 30000);
    }
}

const ConnectedRemoteControlLoader = withRouter(connect()(RemoteControlLoader));

export default generateWrapper(ConnectedRemoteControlLoader);
