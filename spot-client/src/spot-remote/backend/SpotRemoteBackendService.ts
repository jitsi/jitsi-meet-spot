import { SpotBackendService } from '../../common/backend';

const SPOT_REMOTE_ENDPOINT_ID_KEY = 'spot-remote-endpoint-id';

/**
 * The backend service subclass for Spot Remote.
 */
export default class SpotRemoteBackendService extends SpotBackendService {
    /**
     * Creates new {@link SpotRemoteBackendService}.
     *
     * @param config - Spot backend configuration.
     */
    constructor(config: any) {
        super(config, { endpointIdPersistenceKey: SPOT_REMOTE_ENDPOINT_ID_KEY });
    }
}
