import { act, cleanup, render } from '@testing-library/react';
import { mockT } from 'common/test-mocks';
import React from 'react';


import { Countdown } from './Countdown';

describe('Countdown', () => {
    let callbackSpy: jest.Mock;
    let unmount: () => void;

    beforeEach(() => {
        jest.useFakeTimers();

        callbackSpy = jest.fn();

        ({ unmount } = render(
            <Countdown
                onCountdownComplete = { callbackSpy }
                t = { mockT } />
        ));
    });

    afterEach(() => {
        cleanup();
    });

    it('executes the callback after the countdown ends', () => {
        // Advance one second at a time so React commits the state update
        // between each interval tick (as real timers would), mirroring the
        // original two-phase assertion: not called just before the deadline,
        // called once the countdown reaches zero.
        for (let elapsed = 0; elapsed < Countdown.defaultProps.startTime - 1; elapsed++) {
            act(() => {
                jest.advanceTimersByTime(1000);
            });
        }

        expect(callbackSpy).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(callbackSpy).toHaveBeenCalled();
    });

    it('does not execute the callback if unmounted', () => {
        unmount();

        // Advance the full countdown one second at a time — the same cadence that
        // fires the callback on a mounted component (see the test above). With the
        // interval cleared on unmount, no tick runs, so the callback must never fire;
        // a single large advance would pass even without unmount cleanup (React 19
        // batches the synchronous setStates so the time never decrements past one).
        for (let elapsed = 0; elapsed < Countdown.defaultProps.startTime; elapsed++) {
            act(() => {
                jest.advanceTimersByTime(1000);
            });
        }

        expect(callbackSpy).not.toHaveBeenCalled();
    });
});
