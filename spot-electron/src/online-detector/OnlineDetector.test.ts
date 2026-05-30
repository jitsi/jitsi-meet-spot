import { jest } from '@jest/globals';
import type { Mock, SpiedFunction } from 'jest-mock';

import OnlineDetector from './OnlineDetector.js';

describe('OnlineDetector', () => {
    const customCheckInterval = 1000;

    let onlineChangeSpy: Mock<(online: boolean) => void>;
    let isOnlineSpy: SpiedFunction<typeof OnlineDetector._isOnline>;
    let onlineDetector: OnlineDetector;

    /**
     * Helper to advance promises to the next chain.
     *
     * @returns {Promise<void>}
     */
    function nextTick(): Promise<void> {
        return new Promise(resolve => {
            process.nextTick(resolve);
        });
    }

    beforeEach(() => {
        jest.useFakeTimers({ advanceTimers: true });

        isOnlineSpy = jest.spyOn(OnlineDetector, '_isOnline');
        onlineChangeSpy = jest.fn();
        onlineDetector = new OnlineDetector(customCheckInterval);

        onlineDetector.addListener(OnlineDetector.ONLINE_STATUS_CHANGED, onlineChangeSpy);
        onlineDetector.start();
    });

    it('polls for active connection at the provided interval', () => {
        isOnlineSpy.mockReturnValue(Promise.resolve(false));
        jest.advanceTimersByTime(customCheckInterval - 1);

        expect(onlineChangeSpy).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);

        return nextTick()
            .then(() => expect(onlineChangeSpy).toHaveBeenCalledWith(false))
            .then(() => {
                isOnlineSpy.mockReturnValue(Promise.resolve(true));
                jest.advanceTimersByTime(customCheckInterval);

                return nextTick();
            })
            .then(() => expect(onlineChangeSpy).toHaveBeenCalledWith(true));
    });


    it('emits no notification when online status stays the same', () => {
        isOnlineSpy.mockReturnValue(Promise.resolve(false));
        jest.advanceTimersByTime(customCheckInterval);

        return nextTick()
            .then(() => expect(onlineChangeSpy).toHaveBeenCalledWith(false))
            .then(() => {
                jest.advanceTimersByTime(customCheckInterval);

                return nextTick();
            })
            .then(() => expect(onlineChangeSpy.mock.calls.length).toEqual(1));
    });

    it('can pause connection polling', () => {
        isOnlineSpy.mockReturnValue(Promise.resolve(false));
        jest.advanceTimersByTime(customCheckInterval);

        return nextTick()
            .then(() => expect(onlineChangeSpy).toHaveBeenCalledWith(false))
            .then(() => {
                onlineDetector.pause();

                // When not paused, a change in connectivity should trigger
                // a notification.
                isOnlineSpy.mockReturnValue(Promise.resolve(true));

                jest.advanceTimersByTime(customCheckInterval);

                return nextTick();
            })
            .then(() => expect(onlineChangeSpy.mock.calls.length).toEqual(1));

    });

    it('can clean up all listeners', () => {
        onlineDetector.destroy();

        isOnlineSpy.mockReturnValue(Promise.resolve(false));

        jest.advanceTimersByTime(customCheckInterval);

        return nextTick()
            .then(() => expect(onlineChangeSpy).not.toHaveBeenCalled());
    });
});
