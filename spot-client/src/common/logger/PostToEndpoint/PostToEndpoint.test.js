import PostToEndpoint from './PostToEndpoint';
import PostLogsRequest from './PostLogsRequest';
import lolex from 'lolex';

jest.mock('./internalLogger');

describe('PostToEndpoint', () => {
    let clock, postToEndpoint, sendSpy;

    beforeEach(() => {
        // Use lolex because throttle uses system time as well.
        clock = lolex.install();
        clock.setSystemTime(1561219220000);

        postToEndpoint = new PostToEndpoint({
            endpointUrl: ''
        });

        sendSpy = jest.spyOn(PostLogsRequest.prototype, 'send');
    });

    afterEach(() => {
        clock.uninstall();
        sendSpy = null;
        jest.resetAllMocks();
    });

    /**
     * Ticks the clock so throttled functions execute.
     *
     * @private
     * @returns {void}
     */
    function advanceThrottle() {
        clock.tick('00:00:10');
    }

    it('sends logs in batches', () => {
        postToEndpoint.send([ '1' ]);
        postToEndpoint.send([ '2' ]);

        advanceThrottle();

        expect(sendSpy.mock.calls.length).toBe(1);
    });

    it('has one request in flight at a time', () => {
        sendSpy.mockImplementation(() => new Promise(() => { /** no logic needed */ }));

        postToEndpoint.send([ '1' ]);
        advanceThrottle();
        expect(sendSpy.mock.calls.length).toBe(1);

        postToEndpoint.send([ '2' ]);
        advanceThrottle();
        expect(sendSpy.mock.calls.length).toBe(1);
    });

    it('sends any queued logs after a request in flight completes', () => {
        let resolveFirstRequest;
        const firstRequestPromise = new Promise(resolve => {
            resolveFirstRequest = resolve;
        });

        sendSpy.mockImplementation(() => firstRequestPromise);

        postToEndpoint.send([ '1' ]);
        advanceThrottle();

        postToEndpoint.send([ '2' ]);
        expect(sendSpy.mock.calls.length).toBe(1);

        resolveFirstRequest();

        return firstRequestPromise
            .then(() => new Promise(resolve => process.nextTick(resolve)))
            .then(() => advanceThrottle())
            .then(() => expect(sendSpy.mock.calls.length).toBe(2));
    });

    it('retries after an error', () => {
        let rejectFirstRequest;
        const firstRequestPromise = new Promise((_, reject) => {
            rejectFirstRequest = reject;
        });

        sendSpy.mockImplementation(() => firstRequestPromise);

        postToEndpoint.send([ '1' ]);
        advanceThrottle();

        postToEndpoint.send([ '2' ]);

        rejectFirstRequest();

        return firstRequestPromise
            .catch(() => new Promise(resolve => process.nextTick(resolve)))
            .then(() => expect(sendSpy.mock.calls.length).toBe(1))
            .then(() => advanceThrottle())
            .then(() => new Promise(resolve => process.nextTick(resolve)))
            .then(() => expect(sendSpy.mock.calls.length).toBe(2));
    });
});
