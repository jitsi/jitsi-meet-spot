import { fetchRoomInfo, getRemotePairingCode, SpotBackendService } from 'common/backend';
import { logger } from 'common/logger';

/**
 * An extension of {@link SpotBackendService} by functionality used only in Spot TV.
 */
export class SpotTvBackendService extends SpotBackendService {
    /**
     * Creates new {@link SpotBackendService}.
     *
     * @param {SpotBackendConfig} config - Backend service configuration.
     */
    constructor(config) {
        super(config, { endpointIdPersistenceKey: 'spot-tv-endpoint-id' });
        this.remotePairingInfo = { };
    }

    /**
     * Gets a short lived remote pairing code from the backend service. The code is to be used by Spot Remotes that
     * connect to Spot TV only temporarily.
     *
     * @returns {Promise<string>}
     */
    fetchShortLivedPairingCode() {
        return this._fetchPairingCode()
            .then(remotePairingInfo => {
                this.remotePairingInfo = remotePairingInfo;

                return this.getShortLivedPairingCode();
            });
    }

    /**
     * Gets long lived pairing code information to be used by Spot-Remotes that
     * connect long-term to a Spot-TV.
     *
     * @returns {Promise<Object>}
     */
    generateLongLivedPairingCode() {
        logger.log('Fetching long lived pairing code...');

        return this._fetchPairingCode('LONG_LIVED');
    }

    /**
     * Tells how many milliseconds since now until the remote pairing code needs to be refreshed.
     *
     * @returns {number}
     */
    getNextShortLivedPairingCodeRefresh() {
        const FIVE_MINUTES = 5 * 60 * 1000;

        let nextRefresh = FIVE_MINUTES;

        if (this.remotePairingInfo) {
            // Refresh five minutes before the expiration, but not earlier than in 1 second
            nextRefresh = Math.max(1000, this.remotePairingInfo.expires - Date.now() - FIVE_MINUTES);
        }

        return nextRefresh;
    }

    /**
     * Returns a short lived remote pairing code which is to be used by Spot Remotes that connect to Spot TV only
     * temporarily.
     *
     * @returns {string}
     */
    getShortLivedPairingCode() {
        return this.remotePairingInfo.code;
    }

    /**
     * Makes request to the backend and tries to get the exit password. If the requests fails will return the most
     * recent cached value.
     *
     * @returns {Promise<?string>}
     */
    fetchExitPassword() {
        return fetchRoomInfo(
            this.roomKeeperServiceUrl,
            this.getJwt()
        ).then(({ endpointPassword }) => {
            this._cachedExitPassword = endpointPassword && endpointPassword.length ? endpointPassword : undefined;
        }, error => {
            logger.error('Fetch exit password failed', { error });
        })
        .then(() => this._cachedExitPassword);
    }

    /**
     * Helper to encapsulate requesting the backend api for a pairing code.
     *
     * @param {string} type - Should be either "SHORT_LIVED" or "LONG_LIVED".
     * @private
     * @returns {Promise<Object>}
     */
    _fetchPairingCode(type = 'SHORT_LIVED') {
        if (!this.getJwt()) {
            return Promise.reject('Spot TV backend is not registered - no JWT');
        }

        const requestCreator = () => getRemotePairingCode(
            `${this.pairingServiceUrl}/code?pairingType=${type}`,
            this.getJwt()
        );

        return this._wrapJwtBackendRequest(requestCreator);
    }
}

