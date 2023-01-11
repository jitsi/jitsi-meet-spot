import { expect, jest } from '@jest/globals';
import { runAllTimersNTimes, runNTimes } from 'common/test-utils';

import PostLogsRequest from './PostLogsRequest';

jest.mock('./internalLogger');

describe('PostLogsRequest', () => {
    const testDeviceId = 'device-id-123';
    const testEndpoint = '/api/test';
    const testEvents = [ { 1: 1 } ];

    let postLogsRequest;

    beforeEach(() => {
        jest.useFakeTimers({ advanceTimers: true });

        postLogsRequest = new PostLogsRequest(testEvents, testDeviceId, testEndpoint);
    });

    describe('send without error', () => {
        it('resolves on success', () => {
            fetch.mockResponse(() => Promise.resolve({}));

            return postLogsRequest.send();
        });
    });

    describe('retry', () => {
        it('retries on failed send', () => {
            fetch.mockResponses([ JSON.stringify({}), { status: 500 } ], [ JSON.stringify({}), { status: 200 } ]);

            const request = postLogsRequest.send();

            return runAllTimersNTimes(2).then(() => request);
        });

        it('retries at least MAX_RETRIES times', () => {
            const responses = [];

            runNTimes(() => {
                responses.push([ JSON.stringify({}), { status: 500 } ]);
            }, PostLogsRequest.MAX_RETRIES);

            responses.push([ JSON.stringify({}), { status: 200 } ]);

            fetch.mockResponses(...responses);

            const request = postLogsRequest.send();

            return runAllTimersNTimes(PostLogsRequest.MAX_RETRIES).then(() => request);
        });

        it('stops after reaching MAX_RETRIES', () => {
            const responses = [];

            runNTimes(() => {
                responses.push([ JSON.stringify({}), { status: 500 } ]);
            }, PostLogsRequest.MAX_RETRIES + 1);

            fetch.mockResponses(...responses);

            const request = postLogsRequest.send();

            expect(runAllTimersNTimes(PostLogsRequest.MAX_RETRIES + 1).then(() => request)).rejects.toEqual('error');
        });
    });
});
