import { act, render } from '@testing-library/react';
import lolex from 'lolex';
import React from 'react';

import Clock from './Clock';

describe('Clock', () => {
    const twelveHoursInMs = 12 * 60 * 60 * 1000;

    let container: HTMLElement;
    let mockSystemClock: lolex.InstalledClock;

    beforeEach(() => {
        mockSystemClock = lolex.install(); // Sets time to 0
        mockSystemClock.setSystemTime(1574154000000); // Tuesday, 19 November 2019 09:00:00 UTC

        ({ container } = render(<Clock />));
    });

    afterEach(() => {
        mockSystemClock.uninstall();
    });

    describe('time', () => {
        it('displays the current AM time', () => {
            expect(container.querySelector('.time')?.textContent).toEqual('09:00AM');
        });

        it('updates the current time to display PM', () => {
            act(() => {
                mockSystemClock.tick(twelveHoursInMs);
            });

            expect(container.querySelector('.time')?.textContent).toEqual('09:00PM');
        });
    });

    describe('date', () => {
        it('displays the current date', () => {
            expect(container.querySelector('.date')?.textContent).toEqual('Tue, Nov 19');
        });

        it('updates the current date', () => {
            act(() => {
                mockSystemClock.tick(twelveHoursInMs * 2);
            });

            expect(container.querySelector('.date')?.textContent).toEqual('Wed, Nov 20');
        });
    });
});
