import { fetchRoomInfo, registerDevice } from './utils';

/**
 *
 * @typedef {Object} SpotBackendConfig
 * @property {string} pairingServiceUrl - The URL pointing to the pairing service.
 * @property {string} roomKeeperServiceUrl - The URL pointing to the service which manages Spot Rooms.
 */
/**
 * The class exposes backend functionality and stores backend related state.
 */
export class SpotBackendService {
    /**
     * Creates new {@link SpotBackendService}.
     *
     * @param {SpotBackendConfig} config - Spot backend configuration.
     */
    constructor({ pairingServiceUrl, roomKeeperServiceUrl }) {
        if (!pairingServiceUrl) {
            throw Error('No "pairingServiceUrl"');
        }
        if (!roomKeeperServiceUrl) {
            throw Error('No "roomKeeperServiceUrl"');
        }
        this.pairingServiceUrl = pairingServiceUrl;
        this.roomKeeperServiceUrl = roomKeeperServiceUrl;

        /**
         *
         * @type {SpotRegistration|undefined}
         */
        this.registration = undefined;
    }

    /**
     * Returns the JWT provided by the backend.
     *
     * @returns {string|undefined}
     */
    getJwt() {
        return this.registration && this.registration.accessToken;
    }

    /**
     * Gets {@link RoomInfo} info from the backend.
     *
     * @returns {Promise<RoomInfo>}
     */
    getRoomInfo() {
        return fetchRoomInfo(this.roomKeeperServiceUrl, this.getJwt())
            .then(({ mucUrl, name }) => {
                return {
                    name,
                    roomName: mucUrl,
                    roomLock: undefined
                };
            });
    }

    /**
     * Returns true if the current pairing is permanent. This means that the backend has granted a refresh token which
     * can be used to refresh an access token indefinitely.
     *
     * @returns {boolean}
     */
    isPairingPermanent() {
        return Boolean(this.registration && this.registration.refreshToken);
    }

    /**
     * Registers with the backend and stores the access token.
     *
     * @param {string} pairingCode - The pairing code to be used for authentication with the backend service.
     * @returns {Promise<SpotRegistration>}
     */
    register(pairingCode) {
        return registerDevice(`${this.pairingServiceUrl}`, pairingCode)
            .then(registration => {
                this.registration = registration;

                if (!this.getJwt()) {
                    throw new Error('No JWT');
                }
            });
    }
}
