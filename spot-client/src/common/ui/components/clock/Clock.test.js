import { shallow } from 'enzyme';
import lolex from 'lolex';
import React from 'react';

import Clock from './Clock';

describe('Clock', () => {
    const twelveHoursInMs = 12 * 60 * 60 * 1000;

    let clock, mockSystemClock;

    beforeEach(() => {
        mockSystemClock = lolex.install(); // Sets time to 0
        mockSystemClock.setSystemTime(1574154000000); // Tuesday, 19 November 2019 09:00:00 UTC

        clock = shallow(<Clock />);
    });

    afterEach(() => {
        mockSystemClock.uninstall();
    });

    describe('time', () => {
        it('displays the current AM time', () => {
            expect(clock.find('.time').text()).toEqual('09:00AM');
        });

        it('updates the current time to display PM', () => {
            mockSystemClock.tick(twelveHoursInMs);

            expect(clock.find('.time').text()).toEqual('09:00PM');
        });
    });

    describe('date', () => {
        it('displays the current date', () => {
            expect(clock.find('.date').text()).toEqual('Tue, Nov 19');
        });

        it('updates the current date', () => {
            mockSystemClock.tick(twelveHoursInMs * 2);

            expect(clock.find('.date').text()).toEqual('Wed, Nov 20');
        });
    });
});
