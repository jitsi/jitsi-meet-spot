import { SpotBackendService } from './SpotBackendService';
import { persistence } from 'common/utils';

describe('SpotBackendService', () => {
    const PAIRING_SERVICE_URL = 'test/pairing/url';
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

        describe('without stored registration', () => {
            const MOCK_RESPONSE = {
                accessToken: 'new-access-token',
                emitted: '1',
                expiresIn: '2',
                refreshToken: 'new-refresh-token'
            };

            beforeEach(() => {
                jest.useFakeTimers();
                jest.spyOn(persistence, 'get').mockReturnValue(null);
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

                        jest.advanceTimersByTime(1000);

                        expect(fetch).toHaveBeenCalledWith(
                            `${PAIRING_SERVICE_URL}/regenerate`,
                            expect.any(Object)
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
        });
    });
});
