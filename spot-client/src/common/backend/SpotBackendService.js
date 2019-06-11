import { fetchRoomInfo, registerDevice } from './utils';

/**
 *
 * @typedef {Object} SpotBackendConfig
 * @property {string} pairingServiceUrl - The URL pointing to the service which manages Spot Rooms.
 * @property {string} joinCodeServiceUrl - The URL pointing to the pairing service.
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
    constructor({ pairingServiceUrl, joinCodeServiceUrl }) {
        if (!pairingServiceUrl) {
            throw Error('No "pairingServiceUrl"');
        }
        if (!joinCodeServiceUrl) {
            throw Error('No "joinCodeServiceUrl"');
        }
        this.pairingServiceUrl = pairingServiceUrl;
        this.joinCodeServiceUrl = joinCodeServiceUrl;

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
        return fetchRoomInfo(this.joinCodeServiceUrl, this.getJwt())
            .then(({ mucUrl }) => {
                return {
                    roomName: mucUrl,
                    roomLock: undefined
                };
            });
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
