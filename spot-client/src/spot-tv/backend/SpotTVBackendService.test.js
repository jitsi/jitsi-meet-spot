import { persistence } from 'common/utils';

import { SpotTvBackendService } from './SpotTvBackendService';

// FIXME duplicated with SpotBackendService.test.js
jest.mock('common/utils', () => {
    return {
        ...jest.requireActual('common/utils'),
        generateGuid: jest.fn()
    };
});

// FIXME duplicated with SpotBackendService.test.js
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

describe('SpotTvBackendService', () => {
    const PAIRING_SERVICE_URL = 'test/pairing/url';
    const REFRESH_SERVICE_URL = `${PAIRING_SERVICE_URL}/regenerate`;
    const ROOM_KEEPER_SERVICE_URL = 'test/keeper/url';
    let spotBackendService;

    beforeEach(() => {
        spotBackendService = new SpotTvBackendService({
            pairingServiceUrl: PAIRING_SERVICE_URL,
            roomKeeperServiceUrl: ROOM_KEEPER_SERVICE_URL
        });
    });

    describe('generates pairing codes', () => {
        const MOCK_PAIRING_CODE = '123456';
        const MOCK_RESPONSE = {
            accessToken: 'new-access-token',
            emitted: Date.now(),
            expiresIn: 10 * 60 * 1000,
            refreshToken: 'new-refresh-token'
        };

        describe('and refreshes the access token if backend returns 401', () => {
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

            it('when trying to get a short lived code', () =>
                spotBackendService.register(MOCK_PAIRING_CODE)
                    .then(() => {
                        const testShortLivedCode = '113366';

                        // Mock the initial request to fetch the code
                        fetch.once('', {
                            status: 401,
                            ok: false
                        });

                        // Mock the refreshing of the token
                        fetch.once(JSON.stringify(MOCK_RESPONSE));

                        // Mock the request to get room info
                        fetch.once(JSON.stringify({
                            emitted: Date.now(),
                            expiresIn: 60 * 1000,
                            code: testShortLivedCode
                        }));

                        return spotBackendService.fetchShortLivedPairingCode().then(code => {
                            expect(code).toEqual(testShortLivedCode);

                            // Check if the refresh was done (does not check other requests)
                            expect(fetch)
                                .toHaveBeenCalledWith(
                                    REFRESH_SERVICE_URL,
                                    refreshRequestMatcher(MOCK_RESPONSE.refreshToken)
                                );
                        });
                    }));
            it('when trying to get a long lived code', () =>
                spotBackendService.register(MOCK_PAIRING_CODE)
                    .then(() => {
                        const testLongLivedCode = '11336688';

                        // Mock the initial request to fetch the code
                        fetch.once('', {
                            status: 401,
                            ok: false
                        });

                        // Mock the refreshing of the token
                        fetch.once(JSON.stringify(MOCK_RESPONSE));

                        // Mock the request to get room info
                        fetch.once(JSON.stringify({
                            emitted: Date.now(),
                            expiresIn: 60 * 1000,
                            code: testLongLivedCode
                        }));

                        return spotBackendService.generateLongLivedPairingCode()
                            .then(longLivedCodeInfo => {
                                expect(longLivedCodeInfo)
                                    .toMatchObject({
                                        code: testLongLivedCode
                                    });

                                // Check if the refresh was done (does not check other requests)
                                expect(fetch)
                                    .toHaveBeenCalledWith(
                                        REFRESH_SERVICE_URL,
                                        refreshRequestMatcher(MOCK_RESPONSE.refreshToken)
                                    );
                            });
                    }));
        });
    });
});
