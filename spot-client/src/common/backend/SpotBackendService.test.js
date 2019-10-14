import { SpotBackendService } from './SpotBackendService';
import { persistence } from 'common/utils';

jest.mock('common/utils', () => {
    return {
        ...jest.requireActual('common/utils'),
        generateGuid: jest.fn()
    };
});

/**
 * Creates a matcher for refresh request for given params.
 *
 * @param {string} refreshToken - The refresh token.
 * @returns {*}
 */
function refreshRequestMatcher(refreshToken) {
    return expect.objectContaining({
        body: `{"refreshToken":"${refreshToken}"}`,
        method: 'PUT',
        mode: 'cors'
    });
}

/**
 * A test scenario where 401 error is returned to the get room info request and the the backend service is supposed to
 * do the token refresh and retry the get room info again.
 *
 * @param {SpotBackendService} spotBackendService - The backend instance to run the scenario with.
 * @returns {Promise<RoomInfo>}
 */
function checkRetryOn401ToGetRoomInfo(spotBackendService) {
    // Mock the initial request to get room info
    fetch.once('', {
        status: 401,
        ok: false
    });

    // Mock the refreshing of the token
    fetch.once(JSON.stringify({
        accessToken: 'refreshed-access-token',
        emitted: Date.now(),
        expiresIn: 10 * 60 * 1000
    }));

    // Mock the request to get room info
    fetch.once(JSON.stringify({
        id: 'mock-id',
        mucUrl: 'muc-url',
        name: 'mock-muc-name'
    }));

    return spotBackendService.getRoomInfo().then(roomInfo => {
        expect(roomInfo).toEqual({
            id: 'mock-id',
            name: 'mock-muc-name',
            roomName: 'muc-url'
        });
        expect(spotBackendService.getJwt()).toEqual('refreshed-access-token');
    });
}

describe('SpotBackendService', () => {
    const MOCK_ENDPOINT_ID_KEY = 'test-spot-endpoint-id';
    const PAIRING_SERVICE_URL = 'test/pairing/url';
    const REFRESH_SERVICE_URL = `${PAIRING_SERVICE_URL}/regenerate`;
    const ROOM_KEEPER_SERVICE_URL = 'test/keeper/url';

    let spotBackendService;

    beforeEach(() => {
        spotBackendService = new SpotBackendService({
            pairingServiceUrl: PAIRING_SERVICE_URL,
            roomKeeperServiceUrl: ROOM_KEEPER_SERVICE_URL
        }, {
            endpointIdPersistenceKey: MOCK_ENDPOINT_ID_KEY
        });
    });

    describe('register', () => {
        const MOCK_PAIRING_CODE = '123456';
        const MOCK_RESPONSE = {
            accessToken: 'new-access-token',
            emitted: Date.now(),
            expiresIn: 10 * 60 * 1000,
            refreshToken: 'new-refresh-token',
            tenant: 'tenant1'
        };

        describe('without stored registration', () => {

            beforeEach(() => {
                jest.useFakeTimers();
                jest.spyOn(persistence, 'get').mockReturnValue(null);
                fetch.resetMocks();
                fetch.mockResponse(JSON.stringify(MOCK_RESPONSE));
            });

            it('sets the registration', () =>
                spotBackendService.register(MOCK_PAIRING_CODE)
                    .then(() => {
                        expect(fetch).toHaveBeenCalledWith(
                            PAIRING_SERVICE_URL,
                            expect.any(Object)
                        );

                        expect(spotBackendService.getJwt()).toBe(MOCK_RESPONSE.accessToken);
                        expect(spotBackendService.getTenant()).toBe(MOCK_RESPONSE.tenant);
                        expect(spotBackendService.isPairingPermanent()).toBe(true);
                    })
            );

            it('refreshes the token automatically', () =>
                spotBackendService.register(MOCK_PAIRING_CODE)
                    .then(() => {

                        jest.advanceTimersByTime(MOCK_RESPONSE.expiresIn);

                        expect(fetch).toHaveBeenCalledWith(
                            REFRESH_SERVICE_URL,
                            refreshRequestMatcher(MOCK_RESPONSE.refreshToken)
                        );
                    })
            );

            it('notifies listeners of the token refresh - on the initial registration', () => {
                const onUpdateCallback = jest.fn();

                spotBackendService.addListener(
                    SpotBackendService.REGISTRATION_UPDATED,
                    onUpdateCallback
                );

                return spotBackendService.register(MOCK_PAIRING_CODE)
                    .then(() => expect(onUpdateCallback).toHaveBeenCalled());
            });

            it('notifies listeners of the token refresh', () => {
                const MOCK_TENANT_2 = 'tenant2';
                const MOCK_ACESS_TOKEN_2 = 'access-token-2';

                jest.useFakeTimers();

                const onUpdateCallback = jest.fn();

                spotBackendService.addListener(
                    SpotBackendService.REGISTRATION_UPDATED,
                    onUpdateCallback
                );

                fetch.resetMocks();
                fetch.mockResponseOnce(JSON.stringify(MOCK_RESPONSE));
                fetch.mockResponseOnce(JSON.stringify({
                    ...MOCK_RESPONSE,
                    accessToken: MOCK_ACESS_TOKEN_2,
                    tenant: 'tenant2'
                }));

                return spotBackendService.register(MOCK_PAIRING_CODE)
                    .then(() => {
                        jest.runAllTimers();

                        // Advance other async operations
                        return new Promise(resolve => process.nextTick(resolve));
                    })
                    .then(() => {
                        expect(onUpdateCallback).toHaveBeenCalledWith({
                            jwt: MOCK_RESPONSE.accessToken,
                            tenant: MOCK_RESPONSE.tenant
                        });
                        expect(onUpdateCallback).toHaveBeenCalledWith({
                            jwt: MOCK_ACESS_TOKEN_2,
                            tenant: MOCK_TENANT_2
                        });
                    });
            });

            it('clears the registration on room info error', () =>
                spotBackendService.register(MOCK_PAIRING_CODE).then(() => {
                    expect(spotBackendService.isPairingPermanent()).toBe(true);

                    fetch.mockResponse('',
                        {
                            status: 401,
                            ok: false
                        });

                    return spotBackendService.getRoomInfo().catch(() => {
                        expect(spotBackendService.isPairingPermanent()).toBe(false);
                    });
                })
            );

            it('re-uses endpoint ID received on the 1st register', () => {
                const MOCK_ENDPOINT_ID = 'endpointId1';

                fetch.mockResponse(JSON.stringify({
                    ...MOCK_RESPONSE,
                    endpointId: MOCK_ENDPOINT_ID
                }));
                const peristenceSpy = jest.spyOn(persistence, 'get');

                peristenceSpy.mockImplementation(() => undefined);

                return spotBackendService.register(MOCK_PAIRING_CODE)
                    .then(() => {
                        expect(fetch).toHaveBeenCalledWith(
                            PAIRING_SERVICE_URL,
                            expect.objectContaining({
                                body: JSON.stringify({
                                    pairingCode: MOCK_PAIRING_CODE,
                                    endpointId: undefined
                                })
                            }));

                        peristenceSpy.mockImplementation(key => {
                            if (key === MOCK_ENDPOINT_ID_KEY) {
                                return MOCK_ENDPOINT_ID;
                            }

                            return undefined;
                        });

                        return spotBackendService.register('123123').then(() => {
                            expect(fetch).toHaveBeenCalledWith(
                                PAIRING_SERVICE_URL,
                                expect.objectContaining({
                                    body: JSON.stringify({
                                        endpointId: MOCK_ENDPOINT_ID,
                                        pairingCode: '123123'
                                    })
                                }));
                        });
                    });
            });
        });

        describe('with stored registration', () => {
            let dateSpy = null;
            const MOCK_REGISTRATION = {
                ...MOCK_RESPONSE,
                pairingCode: MOCK_PAIRING_CODE,
                expiresIn: undefined,
                expires: MOCK_RESPONSE.emitted + MOCK_RESPONSE.expiresIn
            };

            beforeEach(() => {
                if (dateSpy) {
                    dateSpy.mockRestore();
                    dateSpy = null;
                }
                jest.useFakeTimers();
                jest.spyOn(persistence, 'get')
                    .mockReturnValue(MOCK_REGISTRATION);
                fetch.resetMocks();
                fetch.mockResponse(JSON.stringify(MOCK_RESPONSE));
            });

            it('refresh the registration initially if starts with expired (or almost expired) token', () => {
                dateSpy = jest.spyOn(Date, 'now');
                dateSpy.mockReturnValue(Date.now() + MOCK_RESPONSE.expiresIn);

                return spotBackendService.register(MOCK_PAIRING_CODE)
                    .then(() => {
                        expect(fetch)
                            .toHaveBeenCalledWith(
                                REFRESH_SERVICE_URL,
                                refreshRequestMatcher(MOCK_RESPONSE.refreshToken)
                            );

                        expect(spotBackendService.getJwt())
                            .toBe(MOCK_RESPONSE.accessToken);
                        expect(spotBackendService.isPairingPermanent())
                            .toBe(true);
                    });
            });
            it('notifies the listeners of JWT update - when starting with the registration expired', () => {
                dateSpy = jest.spyOn(Date, 'now');
                dateSpy.mockReturnValue(Date.now() + MOCK_RESPONSE.expiresIn);

                const onUpdateCallback = jest.fn();

                spotBackendService.addListener(
                    SpotBackendService.REGISTRATION_UPDATED,
                    onUpdateCallback
                );

                return spotBackendService.register(MOCK_PAIRING_CODE)
                    .then(() => expect(onUpdateCallback).toHaveBeenCalled());
            });
            it('does NOT refresh the registration initially if lots of time left until the expiration', () =>
                spotBackendService.register(MOCK_PAIRING_CODE)
                    .then(() => {
                        expect(fetch).not.toHaveBeenCalled();

                        expect(spotBackendService.getJwt())
                            .toBe(MOCK_RESPONSE.accessToken);
                        expect(spotBackendService.isPairingPermanent())
                            .toBe(true);
                    })
            );
            it('clears the registration if starts with expired token and initial refresh fails', () => {
                // Starting with expired registration
                const persistenceSpy = jest.spyOn(persistence, 'set');

                jest.spyOn(persistence, 'get').mockReturnValue({
                    ...MOCK_REGISTRATION,
                    expires: Date.now() - 1000
                });

                // Reject the initial refresh
                fetch.once('', {
                    status: 401,
                    ok: false
                });

                return spotBackendService.register(MOCK_PAIRING_CODE).catch(() => {
                    expect(persistenceSpy).toHaveBeenCalledWith('spot-backend-registration', undefined);
                });
            });
        });

        describe('tries to refresh the access token if backend returns 401', () => {
            const MOCK_REGISTRATION = {
                ...MOCK_RESPONSE,
                pairingCode: MOCK_PAIRING_CODE,
                expiresIn: undefined,
                expires: MOCK_RESPONSE.emitted + MOCK_RESPONSE.expiresIn
            };

            beforeEach(() => {
                jest.useFakeTimers();
                jest.spyOn(persistence, 'get')
                    .mockReturnValue(MOCK_REGISTRATION);
                fetch.resetMocks();
            });

            it('refresh the token if get room info on expired', () =>
                spotBackendService.register(MOCK_PAIRING_CODE)
                    .then(() => checkRetryOn401ToGetRoomInfo(spotBackendService))
            );

            it('will not emit registration lost when 401 is returned to get room info', () => {
                const registrationLostCallback = jest.fn();

                spotBackendService.addListener(
                    SpotBackendService.REGISTRATION_LOST,
                    registrationLostCallback
                );

                return spotBackendService.register(MOCK_PAIRING_CODE)
                    .then(() => checkRetryOn401ToGetRoomInfo(spotBackendService)
                        .then(() => {
                            expect(registrationLostCallback).not.toHaveBeenCalled();
                        })
                    );
            });
        });
    });
});
