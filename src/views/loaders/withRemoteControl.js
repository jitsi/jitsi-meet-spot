import PropTypes from 'prop-types';
import { connect } from 'react-redux';

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
     * @override
     */
    _loadService() {
        return remoteControlService.init()
            .then(jid => this.props.dispatch(setLocalRemoteControlID(jid)))
            .then(() =>
                remoteControlService.createMuc(remoteControlService.getNode()))
            .then(() => remoteControlService.joinMuc())
            .catch(error => logger.error(error));
    }
}

const ConnectedRemoteControlLoader = connect()(RemoteControlLoader);

export default generateWrapper(ConnectedRemoteControlLoader);
