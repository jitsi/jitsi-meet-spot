import { fetchMeetingSignature } from 'zoom/sdk/functions';
import { runAllTimersNTimes } from 'common/test-utils';

describe('zoom/functions', () => {
    const MOCK_API_KEY = 'test-zoom-api-key';

    beforeEach(() => {
        global.fetch.resetMocks();
        global.fetch.mockClear('');
    });
    afterEach(() => {
        global.fetch.resetMocks();
    });

    describe('fetchMeetingSignature', () => {
        const MOCK_SERVICE_ENDPOINT = 'zoom-meeting-signature';
        const TEST_SIGNATURE = 'test-signature-123';
        const MOCK_RESPONSE = {
            signature: TEST_SIGNATURE
        };
        const TEST_MEETING_ID = '123456';
        const TEST_JWT = 'any-jwt';

        it('makes a request and returns a signature', () => {
            fetch.mockResponseOnce(JSON.stringify(MOCK_RESPONSE));

            return fetchMeetingSignature(MOCK_API_KEY, MOCK_SERVICE_ENDPOINT, TEST_MEETING_ID, TEST_JWT)
                .then(signature => {
                    expect(fetch).toHaveBeenCalledWith(
                        MOCK_SERVICE_ENDPOINT,
                        expect.objectContaining({
                            body: JSON.stringify({
                                apiKey: MOCK_API_KEY,
                                meetingNumber: TEST_MEETING_ID,
                                role: 0
                            }),
                            headers: {
                                'Authorization': `Bearer ${TEST_JWT}`,
                                'content-type': 'application/json'
                            },
                            method: 'POST',
                            mode: 'cors'
                        }));
                    expect(signature).toEqual(TEST_SIGNATURE);
                });
        });
        it('rejects on error response', () => {
            global.fetch.mockResponseOnce(
                JSON.stringify({
                    error: 'some arguments are invalid'
                }), {
                    status: 400
                });

            return fetchMeetingSignature(MOCK_API_KEY, MOCK_SERVICE_ENDPOINT, TEST_MEETING_ID)
                .then(() => {
                    fail('it should not resolve');
                }, () => {
                    // Reject is expected
                });
        });
        it('retries on 5xx error', () => {
            jest.useFakeTimers();

            global.fetch.mockResponses(
                [
                    JSON.stringify({}),
                    { status: 500 }
                ],
                [
                    JSON.stringify({}),
                    { status: 503 }
                ],
                [
                    JSON.stringify(MOCK_RESPONSE),
                    { status: 200 }
                ]
            );

            const checkResultsPromise
                = fetchMeetingSignature(MOCK_API_KEY, MOCK_SERVICE_ENDPOINT, TEST_MEETING_ID)
                    .then(signature => {
                        expect(signature).toEqual(TEST_SIGNATURE);
                        expect(fetch.mock.calls.length).toEqual(3);
                    });

            return runAllTimersNTimes(3)
                .then(() => checkResultsPromise);
        });
        it('retries on network errors', () => {
            jest.useFakeTimers();

            global.fetch.mockRejectOnce(new Error('some network error'));
            global.fetch.mockRejectOnce(new Error('some other error'));
            global.fetch.mockResponseOnce(JSON.stringify(MOCK_RESPONSE), { status: 200 });

            const checkResultsPromise
                = fetchMeetingSignature(MOCK_API_KEY, MOCK_SERVICE_ENDPOINT, TEST_MEETING_ID)
                .then(signature => {
                    expect(signature).toEqual(TEST_SIGNATURE);
                    expect(fetch.mock.calls.length).toEqual(3);
                });

            return runAllTimersNTimes(3)
                .then(() => checkResultsPromise);
        });
    });
});
