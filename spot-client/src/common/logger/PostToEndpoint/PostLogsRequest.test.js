import PostLogsRequest from './PostLogsRequest';

jest.mock('./internalLogger');

describe('PostLogsRequest', () => {
    const testDeviceId = 'device-id-123';
    const testEndpoint = '/api/test';
    const testEvents = [ { 1: 1 } ];

    let postLogsRequest;

    beforeEach(() => {
        jest.useFakeTimers();

        postLogsRequest = new PostLogsRequest(
            testEvents,
            testDeviceId,
            testEndpoint
        );
    });

    describe('send without error', () => {
        it('resolves on success', () => {
            fetch.mockResponse(() => Promise.resolve({}));

            return postLogsRequest.send();
        });
    });

    describe('retry', () => {
        /**
         * Executes timeouts and proceeds to the next promise chain.
         *
         * @returns {Promise}
         */
        function tickProcess() {
            jest.runAllTimers();

            return new Promise(resolve => process.nextTick(resolve));
        }

        /**
         * Executes a function a specified number of times.
         *
         * @param {Function} func - The function to invoke.
         * @param {number} count - How many times to invoke the function.
         * @returns {void}
         */
        function runNTimes(func, count) {
            for (let i = 0; i < count; i++) {
                func();
            }
        }

        it('retries on failed send', () => {
            fetch.mockResponses(
                [
                    JSON.stringify({}),
                    { status: 500 }
                ],
                [
                    JSON.stringify({}),
                    { status: 200 }
                ]
            );

            const request = postLogsRequest.send();

            return tickProcess()
                .then(() => tickProcess())
                .then(() => request);
        });

        it('retries at least MAX_RETRIES times', () => {
            const responses = [];

            runNTimes(() => {
                responses.push([
                    JSON.stringify({}),
                    { status: 500 }
                ]);
            }, PostLogsRequest.MAX_RETRIES);

            responses.push([
                JSON.stringify({}),
                { status: 200 }
            ]);

            fetch.mockResponses(
                ...responses
            );

            const request = postLogsRequest.send();

            let ticks = tickProcess();

            runNTimes(() => {
                ticks = ticks.then(() => tickProcess());
            }, PostLogsRequest.MAX_RETRIES);


            return ticks.then(() => request);
        });

        it('stops after reaching MAX_RETRIES', () => {
            const responses = [];

            runNTimes(() => {
                responses.push([
                    JSON.stringify({}),
                    { status: 500 }
                ]);
            }, PostLogsRequest.MAX_RETRIES + 1);

            fetch.mockResponses(
                ...responses
            );

            const request = postLogsRequest.send();

            let ticks = tickProcess();

            runNTimes(() => {
                ticks = ticks.then(() => tickProcess());
            }, PostLogsRequest.MAX_RETRIES + 1);


            return ticks
                .then(() => request)
                .then(
                    () => {
                        throw new Error('should not succeed');
                    },
                    err => {
                        expect(err).toEqual('dropped');
                    }
                );
        });
    });
});
