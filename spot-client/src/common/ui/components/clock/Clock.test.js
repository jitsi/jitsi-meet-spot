import { shallow } from 'enzyme';
import lolex from 'lolex';
import React from 'react';

import Clock from './Clock';

describe('Clock', () => {
    const twelveHoursInMs = 12 * 60 * 60 * 1000;

    let clock, mockSystemClock;

    beforeEach(() => {
        mockSystemClock = lolex.install(); // Sets time to 0
        mockSystemClock.setSystemTime(1561219220000); // June 22, 2019 9am Los Angeles

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
            expect(clock.find('.date').text()).toEqual('Sat, Jun 22');
        });

        it('updates the current date', () => {
            mockSystemClock.tick(twelveHoursInMs * 2);

            expect(clock.find('.date').text()).toEqual('Sun, Jun 23');
        });
    });
});
