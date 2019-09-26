import ApiHealthCheck from './ApiHealthCheck';

describe('ApiHealthCheck', () => {
    let apiHealthCheck;

    let mockJitsiApi;

    let onErrorCallback;

    beforeEach(() => {
        jest.useFakeTimers();

        mockJitsiApi = {
            isVideoMuted: jest.fn().mockReturnValue(Promise.resolve())
        };

        onErrorCallback = jest.fn();

        apiHealthCheck = new ApiHealthCheck(mockJitsiApi, onErrorCallback);
    });

    afterEach(() => {
        apiHealthCheck.stop();
    });

    describe('start', () => {
        it('it no-ops if already started', () => {
            apiHealthCheck.start();
            apiHealthCheck.start();

            jest.runAllTimers();

            expect(mockJitsiApi.isVideoMuted.mock.calls.length).toBe(1);
        });
    });

    describe('onError', () => {
        it('is called if the health check errors', () => {
            mockJitsiApi.isVideoMuted.mockReturnValue(Promise.reject());

            apiHealthCheck.start();

            const processHealthCheck = new Promise(resolve => process.nextTick(resolve));

            return processHealthCheck
                .then(() => expect(onErrorCallback).toHaveBeenCalledWith('health-check-request-failed'));
        });

        it('is called if the health check times out', () => {
            mockJitsiApi.isVideoMuted.mockReturnValue(new Promise(() => { /** Hung promise. */ }));

            apiHealthCheck.start();

            const processHealthCheck = new Promise(resolve => process.nextTick(resolve));

            jest.advanceTimersByTime(ApiHealthCheck.pingTimeLimitMs);

            return processHealthCheck
                .then(() => expect(onErrorCallback).toHaveBeenCalledWith('health-check-time-limit-exceeded'));
        });
    });

    describe('stop', () => {
        it('prevents onError from getting called', () => {
            mockJitsiApi.isVideoMuted.mockReturnValue(Promise.reject());

            apiHealthCheck.start();

            apiHealthCheck.stop();
            const processHealthCheck = new Promise(resolve => process.nextTick(resolve));

            return processHealthCheck
                .then(() => expect(onErrorCallback).not.toHaveBeenCalled());
        });

        it('prevents more health checks from being enqueued', () => {
            apiHealthCheck.start();

            apiHealthCheck.stop();
            const processHealthCheck = new Promise(resolve => process.nextTick(resolve));

            return processHealthCheck
                .then(() => {
                    jest.advanceTimersByTime(ApiHealthCheck.pingTimeLimit);

                    expect(mockJitsiApi.isVideoMuted.mock.calls.length).toBe(1);
                });
        });
    });
});
