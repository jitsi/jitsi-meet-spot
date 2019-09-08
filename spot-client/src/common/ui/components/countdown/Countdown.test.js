import React from 'react';
import { shallow } from 'enzyme';

import { mockT } from 'common/test-mocks';

import { Countdown } from './Countdown';

describe('Countdown', () => {
    let callbackSpy, countdown;

    beforeEach(() => {
        jest.useFakeTimers();

        callbackSpy = jest.fn();
    });

    afterEach(() => {
        countdown.unmount();
    });

    it('executes the callback after the countdown ends', () => {
        countdown = shallow(
            <Countdown
                onCountdownComplete = { callbackSpy }
                t = { mockT } />
        );

        jest.advanceTimersByTime((Countdown.defaultProps.startTime * 1000) - 1);

        expect(callbackSpy).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);

        expect(callbackSpy).toHaveBeenCalled();
    });

    it('does not execute the callback if unmounted', () => {
        countdown = shallow(
            <Countdown
                onCountdownComplete = { callbackSpy }
                t = { mockT } />
        );

        countdown.unmount();

        jest.advanceTimersByTime(Countdown.defaultProps.startTime * 1000);

        expect(callbackSpy).not.toHaveBeenCalled();
    });
});
