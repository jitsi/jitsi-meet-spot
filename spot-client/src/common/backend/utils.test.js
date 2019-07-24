import * as utils from './utils';
import { errorConstants } from './constants';

jest.mock('common/utils', () => {
    return {
        ...jest.requireActual('common/utils'),
        generateGuid: jest.fn()
    };
});

describe('utils', () => {
    const MOCK_JWT = 'mock-jwt';
    const MOCK_SERVICE_ENDPOINT = 'access-token-refresh';

    beforeEach(() => {
        global.fetch.resetMocks();
        global.fetch.mockClear('');
    });
    afterEach(() => {
        global.fetch.resetMocks();
    });

    describe('fetchCalendarEvents', () => {
        const MOCK_CAL_ENDPOINT = 'mock-cal/?tzid={tzid}';

        describe('rejects with an error string', () => {
            it('when there is no {tzid} template in service url', () =>
                utils.fetchCalendarEvents('mock_endpoint?tzid', MOCK_JWT)
                    .then(
                        () => Promise.reject('no tzid should fail'),
                        error => expect(error.includes('tzid')).toBe(true)
                    )
            );

            it('when no jwt is passed', () =>
                utils.fetchCalendarEvents(MOCK_CAL_ENDPOINT)
                    .then(
                        () => Promise.reject('no jwt should fail'),
                        error => expect(error.includes('JWT')).toBe(true)
                    )
            );
        });

        it('resolves with calendar data', () => {
            const testCalendarResult = { event: 1 };

            fetch.mockResponseOnce(JSON.stringify(testCalendarResult));

            return utils.fetchCalendarEvents(MOCK_CAL_ENDPOINT, MOCK_JWT)
                .then(events => expect(events).toEqual(testCalendarResult));
        });
    });

    describe('getRemotePairingCode', () => {
        const MOCK_RESPONSE = {
            emitted: '1',
            expiresIn: '2',
            code: 'abc'
        };

        describe('rejects with an error string', () => {
            it('when no jwt is passed', () =>
                utils.getRemotePairingCode(MOCK_SERVICE_ENDPOINT)
                    .then(
                        () => Promise.reject('no jwt should fail'),
                        error => expect(error.includes('JWT')).toBe(true)
                    )
            );
        });

        describe('rejects with an error object', () => {
            it('when the response lacks an "emitted" value', () => {
                fetch.mockResponseOnce(JSON.stringify({
                    ...MOCK_RESPONSE,
                    emitted: undefined
                }));

                return utils.getRemotePairingCode(MOCK_SERVICE_ENDPOINT, MOCK_JWT)
                    .then(
                        () => Promise.reject('no emitted value should fail'),
                        error => expect(error.message.includes('emitted')).toBe(true)
                    );
            });

            it('when the response lacks an expiresIn value', () => {
                fetch.mockResponseOnce(JSON.stringify({
                    ...MOCK_RESPONSE,
                    expiresIn: undefined
                }));

                return utils.getRemotePairingCode(MOCK_SERVICE_ENDPOINT, MOCK_JWT)
                    .then(
                        () => Promise.reject('no expiresIn should fail'),
                        error => expect(error.message.includes('expiresIn')).toBe(true)
                    );
            });

            it('when the response lacks a code value', () => {
                fetch.mockResponseOnce(JSON.stringify({
                    ...MOCK_RESPONSE,
                    code: undefined
                }));

                return utils.getRemotePairingCode(MOCK_SERVICE_ENDPOINT, MOCK_JWT)
                    .then(
                        () => Promise.reject('no code should fail'),
                        error => expect(error.message.includes('code')).toBe(true)
                    );
            });
        });

        it('provides token emitted and expiry dates', () => {
            fetch.mockResponseOnce(JSON.stringify(MOCK_RESPONSE));

            return utils.getRemotePairingCode(MOCK_SERVICE_ENDPOINT, MOCK_JWT)
                .then(result => expect(result).toEqual({
                    code: MOCK_RESPONSE.code,
                    emitted: 1,
                    expires: 3
                }));
        });
    });

    describe('refreshAccessToken', () => {
        const MOCK_TOKENS = {
            accessToken: 'access-token',
            refreshToken: 'refresh-token'
        };
        const MOCK_RESPONSE = {
            accessToken: 'new-access-token',
            emitted: '1',
            expiresIn: '2',
            refreshToken: MOCK_TOKENS.refreshToken
        };

        describe('throws', () => {
            it('when no access token is passed', () => {
                try {
                    const result = utils.refreshAccessToken(
                        MOCK_SERVICE_ENDPOINT,
                        {
                            ...MOCK_TOKENS,
                            accessToken: undefined
                        }
                    );

                    expect(result).toBeFalsy();
                } catch (error) {
                    expect(error.message.includes('Access token')).toBe(true);
                }
            });

            it('when no refresh token is passed', () => {
                try {
                    const result = utils.refreshAccessToken(
                        MOCK_SERVICE_ENDPOINT,
                        {
                            ...MOCK_TOKENS,
                            refreshToken: undefined
                        }
                    );

                    expect(result).toBeFalsy();
                } catch (error) {
                    expect(error.message.includes('Refresh token')).toBe(true);
                }
            });
        });

        describe('rejects with an error object', () => {
            it('when the response lacks an "accessToken" value', () => {
                fetch.mockResponseOnce(JSON.stringify({
                    ...MOCK_RESPONSE,
                    accessToken: undefined
                }));

                return utils.refreshAccessToken(MOCK_SERVICE_ENDPOINT, MOCK_TOKENS)
                    .then(
                        () => Promise.reject('no accessToken should fail'),
                        error => expect(error.message.includes('accessToken')).toBe(true)
                    );
            });

            it('when the response lacks an "emitted" value', () => {
                fetch.mockResponseOnce(JSON.stringify({
                    ...MOCK_RESPONSE,
                    emitted: undefined
                }));

                return utils.refreshAccessToken(MOCK_SERVICE_ENDPOINT, MOCK_TOKENS)
                    .then(
                        () => Promise.reject('no emitted should fail'),
                        error => expect(error.message.includes('emitted')).toBe(true)
                    );
            });

            it('when the response lacks an "expiresIn" value', () => {
                fetch.mockResponseOnce(JSON.stringify({
                    ...MOCK_RESPONSE,
                    expiresIn: undefined
                }));

                return utils.refreshAccessToken(MOCK_SERVICE_ENDPOINT, MOCK_TOKENS)
                    .then(
                        () => Promise.reject('no expiresIn should fail'),
                        error => expect(error.message.includes('expiresIn')).toBe(true)
                    );
            });
        });

        it('returns the new tokens and creation and expiry dates', () => {
            fetch.mockResponseOnce(JSON.stringify(MOCK_RESPONSE));

            return utils.refreshAccessToken(MOCK_SERVICE_ENDPOINT, MOCK_TOKENS)
                .then(result => expect(result).toEqual({
                    accessToken: MOCK_RESPONSE.accessToken,
                    emitted: 1,
                    expires: 3,
                    refreshToken: MOCK_TOKENS.refreshToken
                }));
        });
    });

    describe('registerDevice', () => {
        const MOCK_PAIRING_CODE = 'mock-pairing-code';
        const MOCK_RESPONSE = {
            accessToken: 'new-access-token',
            emitted: '1',
            expiresIn: '2',
            refreshToken: 'new-refresh-token'
        };

        describe('rejects with an error object', () => {
            it('when the response lacks an "accessToken" value', () => {
                fetch.mockResponseOnce(JSON.stringify({
                    ...MOCK_RESPONSE,
                    accessToken: undefined
                }));

                return utils.registerDevice(MOCK_SERVICE_ENDPOINT, MOCK_PAIRING_CODE)
                    .then(
                        () => Promise.reject('no accessToken should fail'),
                        error => expect(error.message.includes('accessToken')).toBe(true)
                    );
            });

            it('when the response lacks an "emitted" value', () => {
                fetch.mockResponseOnce(JSON.stringify({
                    ...MOCK_RESPONSE,
                    emitted: undefined
                }));

                return utils.registerDevice(MOCK_SERVICE_ENDPOINT, MOCK_PAIRING_CODE)
                    .then(
                        () => Promise.reject('no emitted should fail'),
                        error => expect(error.message.includes('emitted')).toBe(true)
                    );
            });

            it('when the response lacks an "expiresIn" value', () => {
                fetch.mockResponseOnce(JSON.stringify({
                    ...MOCK_RESPONSE,
                    expiresIn: undefined
                }));

                return utils.registerDevice(MOCK_SERVICE_ENDPOINT, MOCK_PAIRING_CODE)
                    .then(
                        () => Promise.reject('no expiresIn should fail'),
                        error => expect(error.message.includes('expiresIn')).toBe(true)
                    );
            });
        });

        it('resolves with tokens and new expiry dates', () => {
            fetch.mockResponseOnce(JSON.stringify(MOCK_RESPONSE));

            return utils.registerDevice(MOCK_SERVICE_ENDPOINT, MOCK_PAIRING_CODE)
                .then(result => expect(result).toEqual({
                    accessToken: MOCK_RESPONSE.accessToken,
                    emitted: 1,
                    expires: 3,
                    refreshToken: MOCK_RESPONSE.refreshToken
                }));
        });

        it('resolves even if refresh token is missing', () => {
            fetch.mockResponseOnce(JSON.stringify({
                ...MOCK_RESPONSE,
                refreshToken: undefined
            }));

            return utils.registerDevice(MOCK_SERVICE_ENDPOINT, MOCK_PAIRING_CODE)
                .then(result => expect(result).toEqual({
                    accessToken: MOCK_RESPONSE.accessToken,
                    emitted: 1,
                    expires: 3
                }));
        });
    });

    describe('fetchRoomInfo', () => {
        const MOCK_RESPONSE = {
            id: '123',
            mucUrl: 'url',
            name: 'name'
        };

        it('rejects with a string when no jwt if passed', () =>
            utils.fetchRoomInfo(MOCK_SERVICE_ENDPOINT)
                .then(
                    () => Promise.reject('no jwt should fail'),
                    error => expect(error.includes('jwt')).toBe(true)
                )
        );

        it('rejects with an error object when the response is lacks expected a muc', () => {
            fetch.mockResponseOnce(JSON.stringify({
                ...MOCK_RESPONSE,
                mucUrl: undefined
            }));

            return utils.fetchRoomInfo(MOCK_SERVICE_ENDPOINT, MOCK_JWT)
                .then(
                    () => Promise.reject('no mucUrl should fail'),
                    error => expect(error.message.includes('mucUrl')).toBe(true)
                );
        });

        it('resolves with new room info', () => {
            fetch.mockResponseOnce(JSON.stringify(MOCK_RESPONSE));

            return utils.fetchRoomInfo(MOCK_SERVICE_ENDPOINT, MOCK_JWT)
                .then(result => expect(result).toEqual(MOCK_RESPONSE));
        });

        describe('fetchWithRetry', () => {
            beforeEach(() => {
                jest.useFakeTimers();
            });

            it('retries when the xhr fails', () => {
                fetch.mockResponses(
                    [
                        JSON.stringify({}),
                        { status: 500 }
                    ],
                    [
                        JSON.stringify(MOCK_RESPONSE),
                        { status: 200 }
                    ]
                );

                const request = utils.fetchRoomInfo(MOCK_SERVICE_ENDPOINT, MOCK_JWT);
                const runPromises = new Promise(resolve => process.nextTick(resolve));

                return runPromises
                    .then(() => {
                        jest.runAllTimers();

                        return request;
                    })
                    .then(result => expect(result).toEqual(MOCK_RESPONSE));
            });

            it('does not retry when the server returns an error', () => {
                fetch.mockResponseOnce('', { status: 401 });

                return utils.fetchRoomInfo(MOCK_SERVICE_ENDPOINT, MOCK_JWT)
                    .then(
                        () => Promise.reject('no success on server error'),
                        error => expect(error).toEqual(errorConstants.REQUEST_FAILED)
                    );
            });
        });
    });
});
