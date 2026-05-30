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
 * The registration structure as stored/returned by the backend.
 */
export interface SpotRegistration {
    accessToken?: string;
    expires: number;
    pairingCode?: string;
    refreshToken?: string;
    tenant?: string;
    [key: string]: any;
}

/**
 * Backend configuration used to construct a {@link SpotBackendService}.
 */
export interface SpotBackendConfig {

    /**
     * The URL pointing to the pairing service.
     */
    pairingServiceUrl: string;

    /**
     * The URL pointing to the service which manages Spot Rooms.
     */
    roomKeeperServiceUrl: string;
}

/**
 * Extra options for tweaking the behaviour of {@link SpotBackendService}.
 */
export interface SpotBackendOptions {

    /**
     * The name of persistence key under which the service will store the endpoint ID received from the backend.
     */
    endpointIdPersistenceKey: string;
}

/**
 * Returns how many milliseconds have left since now until given registration object expires.
 *
 * @param registration - The registration instance to be checked.
 * @returns {number}
 */
function getExpiresIn({ expires }: { expires: number; }): number {
    return expires - Date.now();
}

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

    _cachedExitPassword: string | undefined;
    _refreshTimeout: ReturnType<typeof setTimeout> | undefined;
    endpointIdPersistenceKey: string;
    pairingServiceUrl: string;
    roomKeeperServiceUrl: string;
    registration: SpotRegistration | undefined;

    /**
     * Injects test refresh token into the storage, so that automated tests can execute in the backend mode.
     *
     * @param pairingCode - The pairing code to be stored together with the registration.
     * @param refreshToken - The refresh token to be used.
     * @returns {void}
     */
    static injectTestRefreshToken(pairingCode: string, refreshToken: string): void {
        persistence.set(
            PERSISTENCE_KEY, {
                expires: Date.now() - 60000,
                pairingCode,
                refreshToken
            }
        );
    }

    /**
     * Creates new {@link SpotBackendService}.
     *
     * @param config - Spot backend configuration.
     * @param options - Extra options for tweaking the behaviour.
     */
    constructor(
            { pairingServiceUrl, roomKeeperServiceUrl }: SpotBackendConfig,
            { endpointIdPersistenceKey }: SpotBackendOptions) {
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

        /**
         * Variable used to cache the most recent exit password whenever get room info request is made.
         *
         * @protected
         */
        this._cachedExitPassword = undefined;
        this.endpointIdPersistenceKey = endpointIdPersistenceKey;
        this.pairingServiceUrl = pairingServiceUrl;
        this.roomKeeperServiceUrl = roomKeeperServiceUrl;

        this.registration = undefined;
    }

    /**
     * Returns the JWT provided by the backend.
     *
     * @returns {string|undefined}
     */
    getJwt(): string | undefined {
        return this.registration && this.registration.accessToken;
    }

    /**
     * Gets {@link RoomInfo} info from the backend.
     *
     * @returns {Promise<RoomInfo>}
     */
    getRoomInfo(): Promise<any> {
        const requestCreator = () => fetchRoomInfo(
            this.roomKeeperServiceUrl,
            this.getJwt() as string
        );

        return this._wrapJwtBackendRequest(requestCreator)
            .then(({ countryCode, customerId, endpointPassword, id, mucUrl, name }: any) => {
                this._cachedExitPassword = endpointPassword;

                return {
                    countryCode,
                    customerId,
                    id,
                    name,
                    roomName: mucUrl,
                    roomLock: undefined
                };
            }, (error: any) => this._maybeClearRegistration(error));
    }

    /**
     * Returns the tenant part from the backend registration info.
     *
     * @returns {string}
     */
    getTenant(): string | undefined {
        return this.registration && this.registration.tenant;
    }

    /**
     * Returns true if the current pairing is permanent. This means that the backend has granted a refresh token which
     * can be used to refresh an access token indefinitely.
     *
     * @returns {boolean}
     */
    isPairingPermanent(): boolean {
        return Boolean(this.registration && this.registration.refreshToken);
    }

    /**
     * Checks if the error is not fatal and if it makes sense to retry the connection attempt using the same data.
     *
     * @param error - The error object with details about the
     * error or a string that identifies the error.
     * @returns {boolean}
     */
    isRecoverableRequestError(error: Error | string): boolean {
        const message = typeof error === 'object' ? error.message : error;

        return message !== errorConstants.REQUEST_FAILED
            && message !== errorConstants.NOT_AUTHORIZED;
    }

    /**
     * This is the error handler to be used on all backend requests. It will check if the access token has been rejected
     * by the backend and clear the stored registration.
     *
     * @param error - Error thrown by the backend request function.
     * @private
     * @returns {void}
     */
    _maybeClearRegistration(error: Error | string): never {
        if (!this.isRecoverableRequestError(error)) {
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
     * @param registration - The registration object to be used for the refresh.
     * @returns {Promise<SpotRegistration>} - A promise resolved on success.
     * @private
     */
    _refreshRegistration(registration: SpotRegistration | undefined): Promise<SpotRegistration> {
        if (!registration) {
            return Promise.reject('No registration object passed to _refreshRegistration');
        }

        const { pairingCode } = registration;

        logger.log('Refreshing access token...', { pairingCode });

        return refreshAccessToken(`${this.pairingServiceUrl}/regenerate`, registration as { refreshToken: string; })
            .then(({ accessToken, expires, tenant }: any) => {
                // copy the fields to preserve the refresh token
                const newRegistration = {
                    ...registration,
                    accessToken,
                    expires,
                    tenant
                };

                this._setRegistration(pairingCode, newRegistration);

                return newRegistration;
            }, (error: any) => this._maybeClearRegistration(error));
    }

    /**
     * Registers with the backend and stores the access token.
     *
     * @param pairingCode - The pairing code to be used for authentication with the backend service.
     * @returns {Promise<void>}
     */
    register(pairingCode: string): Promise<void> {
        const storedRegistration: SpotRegistration | undefined = persistence.get(PERSISTENCE_KEY);

        let registerDevicePromise: Promise<SpotRegistration> | undefined;

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
                    .then((registration: any) => {
                        const { endpointId, ...rest } = registration;

                        if (storedEndpointId !== endpointId) {
                            logger.log('Storing new endpoint ID', {
                                endpointId,
                                endpointIdPersistenceKey: this.endpointIdPersistenceKey
                            });
                            persistence.set(this.endpointIdPersistenceKey, endpointId);
                        }

                        return { ...rest };
                    }, (error: any) => this._maybeClearRegistration(error));
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
    _setRefreshTimeout(): void {
        clearTimeout(this._refreshTimeout);

        // Only long lived tokens can be refreshed
        if (!this.registration || !this.registration.refreshToken) {
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
     * @param pairingCode - The pairing which was used to register with the backend.
     * @param registration - The backend registration structure to be stored.
     * @private
     * @returns {void}
     */
    _setRegistration(pairingCode: string | undefined, registration: SpotRegistration): void {
        this.registration = {
            ...registration,
            pairingCode
        };

        if (!this.getJwt()) {
            throw new Error('no-jwt');
        }

        // Only long lived registrations are persisted
        if (this.registration.refreshToken) {
            persistence.set(PERSISTENCE_KEY, this.registration);
        }

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
    stop(): void {
        clearTimeout(this._refreshTimeout);
    }

    /**
     * Executes a request and will retry one time with a renewed auth token.
     * Used for automatically renewing authorization or retrying on random
     * backend unauthorized errors.
     *
     * @param requestCreator - A function to invoke which
     * makes a request to the backend using a jwt.
     * @protected
     * @returns {Promise} Resolves when the backend request has succeeded
     * initially or after a retry on failed authorization.
     */
    _wrapJwtBackendRequest(requestCreator: () => Promise<any>): Promise<any> {
        let promiseChain: Promise<any> = Promise.resolve();

        if (this.registration && getExpiresIn(this.registration) < 0) {
            promiseChain = this._refreshRegistration(this.registration);
        }

        return promiseChain.then(
            () => requestCreator().catch((error: any) => {
                if (error !== errorConstants.NOT_AUTHORIZED) {
                    throw error;
                }

                logger.warn('Request failed with not-authorized - will attempt to refresh and try again.');

                return this._refreshRegistration(this.registration).then(() => requestCreator());
            })
        );
    }
}
