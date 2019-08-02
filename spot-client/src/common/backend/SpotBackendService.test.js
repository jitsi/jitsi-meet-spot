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

describe('SpotBackendService', () => {
    const PAIRING_SERVICE_URL = 'test/pairing/url';
    const REFRESH_SERVICE_URL = `${PAIRING_SERVICE_URL}/regenerate`;
    const ROOM_KEEPER_SERVICE_URL = 'test/keeper/url';
    let spotBackendService;

    beforeEach(() => {
        spotBackendService = new SpotBackendService({
            pairingServiceUrl: PAIRING_SERVICE_URL,
            roomKeeperServiceUrl: ROOM_KEEPER_SERVICE_URL
        });
    });

    describe('register', () => {
        const MOCK_PAIRING_CODE = '123456';
        const MOCK_RESPONSE = {
            accessToken: 'new-access-token',
            emitted: Date.now(),
            expiresIn: 10 * 60 * 1000,
            refreshToken: 'new-refresh-token'
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

            it('notifies listeners of the token refresh', () => {
                jest.useFakeTimers();

                const onUpdateCallback = jest.fn();

                spotBackendService.addListener(
                    SpotBackendService.REGISTRATION_UPDATED,
                    onUpdateCallback
                );

                return spotBackendService.register(MOCK_PAIRING_CODE)
                    .then(() => {
                        jest.runAllTimers();

                        // Advance other async operations
                        return new Promise(resolve => process.nextTick(resolve));
                    })
                    .then(() => expect(onUpdateCallback).toHaveBeenCalled());
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
                    .then(() => {
                        // Mock the initial request to get room info
                        fetch.once('', {
                            status: 401,
                            ok: false
                        });

                        // Mock the refreshing of the token
                        fetch.once(JSON.stringify(MOCK_RESPONSE));

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
                        });
                    }));
        });
    });
});
