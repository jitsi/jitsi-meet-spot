import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { setLocalRemoteControlID } from 'actions';
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
        const remoteIdParam = this.props.match
            && this.props.match.params
            && this.props.match.params.remoteId;
        const remoteId = remoteIdParam && decodeURIComponent(remoteIdParam);

        return remoteId && remoteId.split('@')[0];
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
        return remoteControlService.init(this._getRoomName())
            .then(() => {
                const roomFullJid = remoteControlService.getRoomFullJid();

                this.props.dispatch(setLocalRemoteControlID(roomFullJid));
            })
            .catch(error => logger.error(error));
    }
}

const ConnectedRemoteControlLoader = withRouter(connect()(RemoteControlLoader));

export default generateWrapper(ConnectedRemoteControlLoader);
