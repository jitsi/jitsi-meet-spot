import { act, render } from '@testing-library/react';
import { mockT } from 'common/test-mocks';
import { Countdown } from 'common/ui/components/countdown/Countdown';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';


import { KickedOverlay } from './KickedOverlay';

describe('KickedOverlay', () => {
    it('invokes the callback after countdown completes', () => {
        jest.useFakeTimers();

        const callback = jest.fn();
        const store = createStore((state = { config: {} }) => state);

        render(
            <Provider store = { store }>
                <KickedOverlay
                    onRedirect = { callback }
                    t = { mockT } />
            </Provider>
        );

        // Advance one second at a time so React commits the inner Countdown's
        // state update between each interval tick (as real timers would);
        // running every tick synchronously would leave the countdown's time
        // stale and loop forever.
        for (let elapsed = 0; elapsed < Countdown.defaultProps.startTime; elapsed++) {
            act(() => {
                jest.advanceTimersByTime(1000);
            });
        }

        expect(callback).toHaveBeenCalled();
    });
});
