import { getRemotePairingCode, SpotBackendService } from 'common/backend';

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
        super(config);
        this.remotePairingInfo = { };
    }

    /**
     * Gets a short lived remote pairing code from the backend service. The code is to be used by Spot Remotes that
     * connect to Spot TV only temporarily.
     *
     * @returns {Promise<string>}
     */
    fetchShortLivedPairingCode() {
        if (!this.getJwt()) {
            return Promise.reject('Spot TV backend is not registered - no JWT');
        }

        return getRemotePairingCode(`${this.pairingServiceUrl}/code`, this.getJwt())
            .then(remotePairingInfo => {
                this.remotePairingInfo = remotePairingInfo;

                return this.getShortLivedPairingCode();
            });
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
            nextRefresh = Math.max(1000, this.remotePairingInfo.expires - new Date().getTime() - FIVE_MINUTES);
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
}

