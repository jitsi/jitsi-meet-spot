import UltrasoundTransmitter from './UltrasoundTransmitter';

jest.mock('lib-quiet-js', () => {
    return {
        ...jest.requireActual('lib-quiet-js'),
        Transmitter: jest.fn().mockImplementation(options => {
            return {
                destroy: jest.fn(),
                transmit: () => {
                    setTimeout(() => options.onFinish(), 1);
                }
            };
        })
    };
});

describe('UltrasoundTransmitter', () => {
    const transmitInterval = 200;
    let transmitSpy, ultrasoundService;

    beforeEach(() => {
        jest.useFakeTimers();

        ultrasoundService = new UltrasoundTransmitter(transmitInterval);
        transmitSpy = jest.spyOn(ultrasoundService, '_transmit');

        ultrasoundService.broadcast('12345');
    });

    afterEach(() => {
        ultrasoundService.destroy();
    });

    it('emits at the provided interval', () => {
        expect(transmitSpy.mock.calls.length).toBe(1);

        jest.advanceTimersByTime(transmitInterval);

        expect(transmitSpy.mock.calls.length).toBe(1);

        jest.advanceTimersByTime(1);

        expect(transmitSpy.mock.calls.length).toBe(2);
    });

    it('stops emitting when explicitly stopped', () => {
        ultrasoundService.stopBroadcasting();

        jest.runOnlyPendingTimers();

        expect(transmitSpy.mock.calls.length).toBe(1);
    });

    it('stops emitting after being destroyed', () => {
        ultrasoundService.destroy();

        jest.runOnlyPendingTimers();

        expect(transmitSpy.mock.calls.length).toBe(1);
    });
});
