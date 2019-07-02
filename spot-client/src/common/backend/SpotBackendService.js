import { logger } from 'common/logger';

import { persistence } from '../utils';

import { errorConstants } from './constants';
import {
    fetchRoomInfo,
    isUnrecoverableError,
    refreshAccessToken,
    registerDevice
} from './utils';

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const FIVE_MINUTES = 5 * ONE_MINUTE;

const PERSISTENCE_KEY = 'spot-backend-registration';

/**
 * Returns how many milliseconds have left since now until given registration object expires.
 *
 * @param {SpotRegistration} registration - The registration instance to be checked.
 * @param {number} expires - The expiration timestamp as defined by the {@link SpotRegistration} type.
 * @returns {number}
 */
function getExpiresIn({ expires }) {
    return expires - new Date().getTime();
}

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
     * Tries to refresh the backend registration.
     *
     * @param {SpotRegistration} registration - The registration object to be used for the refresh.
     * @returns {Promise<void>} - A promise resolved on success.
     * @private
     */
    _refreshRegistration(registration) {
        const { pairingCode } = registration;

        logger.log('Refreshing access token...', { pairingCode });

        return refreshAccessToken(`${this.pairingServiceUrl}\\refresh`, registration)
            .then(({ accessToken, emitted, expires }) => {
                // copy the fields to preserve the refresh token
                this._setRegistration(
                    pairingCode, {
                        ...registration,
                        accessToken,
                        emitted,
                        expires
                    });
            });
    }

    /**
     * Registers with the backend and stores the access token.
     *
     * @param {string} pairingCode - The pairing code to be used for authentication with the backend service.
     * @returns {Promise<SpotRegistration>}
     */
    register(pairingCode) {
        const storedRegistration = persistence.get(PERSISTENCE_KEY);
        let usingStoredRegistration = false;
        let registerDevicePromise;

        if (storedRegistration && storedRegistration.pairingCode === pairingCode) {
            logger.log('Restored previous backend registration', { pairingCode });

            if (storedRegistration.refreshToken) {
                if (getExpiresIn(storedRegistration) < FIVE_MINUTES) {
                    registerDevicePromise = this._refreshRegistration(storedRegistration);
                } else {
                    registerDevicePromise = Promise.resolve(storedRegistration);
                }
                usingStoredRegistration = true;
            }
        }

        if (!registerDevicePromise) {
            logger.log('No stored registration');
            registerDevicePromise = registerDevice(`${this.pairingServiceUrl}`, pairingCode);
        }

        return registerDevicePromise
            .then(registration => {
                this._setRegistration(pairingCode, registration);

                if (!this.getJwt()) {
                    throw new Error(errorConstants.NO_JWT);
                }
            })
            .catch(error => {
                if (isUnrecoverableError(error) && usingStoredRegistration) {
                    persistence.set(PERSISTENCE_KEY, undefined);
                }

                throw error;
            });
    }

    /**
     * Schedules next access token refresh.
     *
     * @private
     * @returns {void}
     */
    _setRefreshTimeout() {
        clearTimeout(this._refreshTimeout);

        // Only long lived tokens can be refreshed
        if (!this.registration.refreshToken) {
            return;
        }

        // If the token is soon to be expired (in less than 5 minutes or has expired already) refresh in 1 second
        const remainingMillis = getExpiresIn(this.registration);
        const delay = Math.max(remainingMillis - FIVE_MINUTES, ONE_SECOND);

        logger.log(
            `The access token will expire in ${remainingMillis / ONE_MINUTE} minutes,`
            + `scheduling refresh to be done in ${delay / ONE_MINUTE} minutes`);

        this._refreshTimeout = setTimeout(() => {
            this._refreshRegistration();
        }, delay);
    }

    /**
     * Stores the current backend registration and the pairing code associated with that registration.
     *
     * @param {string} pairingCode - The pairing which was used to register with the backend.
     * @param {SpotRegistration} registration - The backend registration structure to be stored.
     * @private
     * @returns {void}
     */
    _setRegistration(pairingCode, registration) {
        this.registration = {
            ...registration,
            pairingCode
        };

        // Only long lived registrations are persisted
        this.registration.refreshToken && persistence.set(PERSISTENCE_KEY, this.registration);

        this._setRefreshTimeout();
    }

    /**
     * Stops any pending timers that might have been scheduled.
     *
     * @returns {void}
     */
    stop() {
        clearTimeout(this._refreshTimeout);
    }
}
