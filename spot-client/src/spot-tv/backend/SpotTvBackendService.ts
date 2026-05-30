import { SpotBackendService, fetchRoomInfo, getRemotePairingCode } from 'common/backend';
import { logger } from 'common/logger';

/**
 * An extension of {@link SpotBackendService} by functionality used only in Spot TV.
 */
export class SpotTvBackendService extends SpotBackendService {
    remotePairingInfo: any;

    /**
     * Creates new {@link SpotBackendService}.
     *
     * @param config - Backend service configuration.
     */
    constructor(config: any) {
        super(config, { endpointIdPersistenceKey: 'spot-tv-endpoint-id' });
        this.remotePairingInfo = { };
    }

    /**
     * Gets a short lived remote pairing code from the backend service. The code is to be used by Spot Remotes that
     * connect to Spot TV only temporarily.
     *
     * @returns
     */
    fetchShortLivedPairingCode(): Promise<string> {
        return this._fetchPairingCode()
            .then((remotePairingInfo: any) => {
                this.remotePairingInfo = remotePairingInfo;

                return this.getShortLivedPairingCode();
            });
    }

    /**
     * Gets long lived pairing code information to be used by Spot-Remotes that
     * connect long-term to a Spot-TV.
     *
     * @returns
     */
    generateLongLivedPairingCode(): Promise<any> {
        logger.log('Fetching long lived pairing code...');

        return this._fetchPairingCode('LONG_LIVED');
    }

    /**
     * Tells how many milliseconds since now until the remote pairing code needs to be refreshed.
     *
     * @returns
     */
    getNextShortLivedPairingCodeRefresh(): number {
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
     * @returns
     */
    getShortLivedPairingCode(): string {
        return this.remotePairingInfo.code;
    }

    /**
     * Makes request to the backend and tries to get the exit password. If the requests fails will return the most
     * recent cached value.
     *
     * @returns
     */
    fetchExitPassword(): Promise<string | undefined> {
        return fetchRoomInfo(
            this.roomKeeperServiceUrl,
            this.getJwt() as string
        ).then(({ endpointPassword }: { endpointPassword?: string; }) => {
            this._cachedExitPassword = endpointPassword && endpointPassword.length ? endpointPassword : undefined;
        }, (error: any) => {
            logger.error('Fetch exit password failed', { error });
        })
        .then(() => this._cachedExitPassword);
    }

    /**
     * Helper to encapsulate requesting the backend api for a pairing code.
     *
     * @param type - Should be either "SHORT_LIVED" or "LONG_LIVED".
     * @private
     * @returns
     */
    _fetchPairingCode(type = 'SHORT_LIVED'): Promise<any> {
        if (!this.getJwt()) {
            return Promise.reject('Spot TV backend is not registered - no JWT');
        }

        const requestCreator = () => getRemotePairingCode(
            `${this.pairingServiceUrl}/code?pairingType=${type}`,
            this.getJwt() as string
        );

        return this._wrapJwtBackendRequest(requestCreator);
    }
}
