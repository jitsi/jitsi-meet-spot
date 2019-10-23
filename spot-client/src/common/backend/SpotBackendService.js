import { Emitter } from 'common/emitter';
import { logger } from 'common/logger';

import { persistence } from '../utils';

import { errorConstants } from './constants';
import {
    fetchRoomInfo,
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
    return expires - Date.now();
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
export class SpotBackendService extends Emitter {
    /**
     * The spot backend service has lost the registration with the backend by not being able to use
     * the refresh token to renew the access token.
     */
    static REGISTRATION_LOST = 'registration-lost';
    static REGISTRATION_UPDATED = 'registration-updated';

    /**
     * Creates new {@link SpotBackendService}.
     *
     * @param {SpotBackendConfig} config - Spot backend configuration.
     * @param {Object} options - Extra options for tweaking the behaviour.
     * @param {string} options.endpointIdPersistenceKey - The name of persistence key under which the service will store
     * the endpoint ID received from the backend.
     */
    constructor({ pairingServiceUrl, roomKeeperServiceUrl }, { endpointIdPersistenceKey }) {
        super();

        if (!pairingServiceUrl) {
            throw Error('No "pairingServiceUrl"');
        }
        if (!roomKeeperServiceUrl) {
            throw Error('No "roomKeeperServiceUrl"');
        }
        if (!endpointIdPersistenceKey) {
            throw Error('No "endpointIdPersistenceKey"');
        }
        this.endpointIdPersistenceKey = endpointIdPersistenceKey;
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
        const requestCreator = () => fetchRoomInfo(
            this.roomKeeperServiceUrl,
            this.getJwt()
        );

        return this._wrapJwtBackendRequest(requestCreator)
            .then(({ countryCode, customerId, id, mucUrl, name }) => {
                return {
                    countryCode,
                    customerId,
                    id,
                    name,
                    roomName: mucUrl,
                    roomLock: undefined
                };
            }, error => this._maybeClearRegistration(error));
    }

    /**
     * Returns the tenant part from the backend registration info.
     *
     * @returns {string}
     */
    getTenant() {
        return this.registration && this.registration.tenant;
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
     * Checks if the error is one that is fatal and should not be retried.
     *
     * @param {Error|string} error - The error object with details about the
     * error or a string that identifies the error.
     * @returns {boolean}
     */
    isUnrecoverableRequestError(error) {
        const message = typeof error === 'object' ? error.message : error;

        return message === errorConstants.REQUEST_FAILED
            || message === errorConstants.NOT_AUTHORIZED;
    }

    /**
     * This is the error handler to be used on all backend requests. It will check if the access token has been rejected
     * by the backend and clear the stored registration.
     *
     * @param {Error|string} error - Error thrown by the backend request function.
     * @private
     * @returns {void}
     */
    _maybeClearRegistration(error) {
        if (this.isUnrecoverableRequestError(error)) {
            if (this.registration) {
                logger.log('Cleared backend registration');
                persistence.set(PERSISTENCE_KEY, undefined);
                this.registration = undefined;

                // Emit event with empty jwt which means the backend registration is lost
                this.emit(SpotBackendService.REGISTRATION_LOST, error);
            }
        }

        throw error;
    }

    /**
     * Tries to refresh the backend registration.
     *
     * @param {SpotRegistration} registration - The registration object to be used for the refresh.
     * @returns {Promise<SpotRegistration>} - A promise resolved on success.
     * @private
     */
    _refreshRegistration(registration) {
        if (!registration) {
            return Promise.reject('No registration object passed to _refreshRegistration');
        }

        const { pairingCode } = registration;

        logger.log('Refreshing access token...', { pairingCode });

        return refreshAccessToken(`${this.pairingServiceUrl}/regenerate`, registration)
            .then(({ accessToken, emitted, expires, tenant }) => {
                // copy the fields to preserve the refresh token
                const newRegistration = {
                    ...registration,
                    accessToken,
                    emitted,
                    expires,
                    tenant
                };

                this._setRegistration(pairingCode, newRegistration);

                return newRegistration;
            }, error => this._maybeClearRegistration(error));
    }

    /**
     * Registers with the backend and stores the access token.
     *
     * @param {string} pairingCode - The pairing code to be used for authentication with the backend service.
     * @returns {Promise<void>}
     */
    register(pairingCode) {
        const storedRegistration = persistence.get(PERSISTENCE_KEY);

        let registerDevicePromise;

        if (storedRegistration && storedRegistration.pairingCode === pairingCode) {
            logger.log('Restored previous backend registration', { pairingCode });

            if (storedRegistration.refreshToken) {
                const expiresIn = getExpiresIn(storedRegistration);

                if (expiresIn < FIVE_MINUTES) {
                    // Need to attach the registration, so that it is correctly cleared on refresh failure.
                    this.registration = storedRegistration;
                    registerDevicePromise = this._refreshRegistration(storedRegistration);
                } else {
                    registerDevicePromise = Promise.resolve(storedRegistration);
                }
            }
        }

        if (!registerDevicePromise) {
            const storedEndpointId = persistence.get(this.endpointIdPersistenceKey);

            logger.log('No stored registration', {
                endpointIdPersistenceKey: this.endpointIdPersistenceKey,
                pairingCode,
                storedEndpointId,
                storedPairingCode: storedRegistration && storedRegistration.pairingCode
            });

            registerDevicePromise
                = registerDevice(`${this.pairingServiceUrl}`, pairingCode, storedEndpointId)
                    .then(registration => {
                        const { endpointId, ...rest } = registration;

                        if (storedEndpointId !== endpointId) {
                            logger.log('Storing new endpoint ID', {
                                endpointId,
                                endpointIdPersistenceKey: this.endpointIdPersistenceKey
                            });
                            persistence.set(this.endpointIdPersistenceKey, endpointId);
                        }

                        return { ...rest };
                    }, error => this._maybeClearRegistration(error));
        }

        return registerDevicePromise
            .then(registration => {
                this._setRegistration(pairingCode, registration);
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
            if (!this.registration) {
                logger.error('Unable to refresh access token - no registration');

                return;
            }

            this._refreshRegistration(this.registration)
                .catch(error => {
                    // It is not clear from here, but _setRegistration emits the events about registration lost
                    // and re-throws. This block only prevents unhandled promise rejection.
                    logger.error('Access token refresh failed', { error });
                });
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

        if (!this.getJwt()) {
            throw new Error('no-jwt');
        }

        // Only long lived registrations are persisted
        this.registration.refreshToken && persistence.set(PERSISTENCE_KEY, this.registration);

        this.emit(SpotBackendService.REGISTRATION_UPDATED, {
            jwt: this.getJwt(),
            tenant: this.getTenant()
        });

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

    /**
     * Executes a request and will retry one time with a renewed auth token.
     * Used for automatically renewing authorization or retrying on random
     * backend unauthorized errors.
     *
     * @param {Function<Promise>} requestCreator - A function to invoke which
     * makes a request to the backend using a jwt.
     * @protected
     * @returns {Promise} Resolves when the backend request has succeeded
     * initially or after a retry on failed authorization.
     */
    _wrapJwtBackendRequest(requestCreator) {
        let promiseChain = Promise.resolve();

        if (getExpiresIn(this.registration) < 0) {
            promiseChain = this._refreshRegistration(this.registration);
        }

        return promiseChain.then(
            () => requestCreator().catch(error => {
                if (error !== errorConstants.NOT_AUTHORIZED) {
                    throw error;
                }

                logger.warn('Request failed with not-authorized - will attempt to refresh and try again.');

                return this._refreshRegistration(this.registration).then(() => requestCreator());
            })
        );
    }
}
