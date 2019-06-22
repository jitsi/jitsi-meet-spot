import lolex from 'lolex';

import TimeRangePoller from './TimeRangePoller';

describe('TimeRangePoller', () => {
    const pollInterval = 1000 * 60 * 10; // every 10 minutes
    const clockTick1Hour = '01:00:00';
    const clockTick5Minutes = '00:05:00';

    let callback, clock, timeRangePoller;

    beforeEach(() => {
        callback = jest.fn();

        clock = lolex.install(); // Sets time to 0
        clock.setSystemTime(1561219220000); // June 22, 2019 9am Los Angeles

        timeRangePoller = new TimeRangePoller({
            endHour: 11,
            frequency: pollInterval,
            startHour: 10
        });

        timeRangePoller.addListener(
            TimeRangePoller.CURRENT_TIME_WITHIN_RANGE,
            callback
        );

        timeRangePoller.start();
    });

    afterEach(() => {
        timeRangePoller.stop();
        clock = clock.uninstall();
    });

    describe('start', () => {
        it('notifies when the current time is within the hour range', () => {
            clock.tick(clockTick1Hour);

            expect(callback).toHaveBeenCalled();
        });

        it('checks the time at the configured interval', () => {
            clock.tick(clockTick1Hour);
            expect(callback.mock.calls.length).toBe(1);

            clock.tick(clockTick5Minutes);
            expect(callback.mock.calls.length).toBe(1);

            clock.tick(clockTick5Minutes);
            expect(callback.mock.calls.length).toBe(2);
        });
    });

    describe('stop', () => {
        it('stops checking the time', () => {
            clock.tick(clockTick1Hour);
            expect(callback.mock.calls.length).toBe(1);

            timeRangePoller.stop();

            clock.next();

            expect(callback.mock.calls.length).toBe(1);
        });
    });
});
