import { withRouter } from 'react-router-dom';

import { remoteControlClient } from 'common/remote-control';
import { AbstractLoader, generateWrapper } from 'common/ui';

/**
 * Loads application services while displaying a loading icon. Will display
 * the passed-in children when loading is complete.
 *
 * @extends React.Component
 */
export class RemoteControlLoader extends AbstractLoader {
    static propTypes = {
        ...AbstractLoader.propTypes
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

        return Promise.reject('Spot Remote connection must be started with action');
    }
}


const ConnectedRemoteControlLoader = withRouter(RemoteControlLoader);

export default generateWrapper(ConnectedRemoteControlLoader);
