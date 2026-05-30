import { mockT } from 'common/test-mocks';
import * as utils from 'common/utils';
import { ReactWrapper, mount } from 'enzyme';
import React from 'react';


jest.mock('common/utils', () => {
    return {
        getRandomMeetingName: jest.fn()
    };
});

import { SelfFillingNameEntry } from './SelfFillingNameEntry';

describe('SelfFillingNameEntry', () => {
    const RANDOM_MEETING = 'random placeholder';
    const { animationRevealRate, animationStartDelay } = SelfFillingNameEntry.defaultProps;

    let onSubmitCallback: jest.Mock;
    let randomNameSpy: jest.SpyInstance;
    let selfFillingNameEntry: ReactWrapper;

    beforeEach(() => {
        jest.useFakeTimers();

        randomNameSpy = jest.spyOn(utils, 'getRandomMeetingName');
        randomNameSpy.mockReturnValue(RANDOM_MEETING);

        onSubmitCallback = jest.fn();

        selfFillingNameEntry = mount(
            <SelfFillingNameEntry
                onSubmit = { onSubmitCallback }
                t = { mockT } />
        );
    });

    afterEach(() => {
        selfFillingNameEntry.unmount();
    });

    /**
     * Sets the entered meeting name.
     *
     * @param newValue - The entered value to set in the input.
     * @private
     * @returns {void}
     */
    function setInputValue(newValue: string) {
        const input = selfFillingNameEntry.find('input');

        (input.instance() as unknown as HTMLInputElement).value = newValue;
        input.simulate('change');
    }

    /**
     * Returns the current animating placeholder from the component state.
     *
     * @private
     * @returns {string}
     */
    function getAnimatingPlaceholder(): string {
        return (selfFillingNameEntry.state() as { animatingPlaceholder: string; }).animatingPlaceholder;
    }

    describe('animated name display', () => {
        it('starts after a delay', () => {
            jest.advanceTimersByTime(animationStartDelay - 1);

            expect(getAnimatingPlaceholder()).toBe('');

            jest.advanceTimersByTime(animationRevealRate + 1);

            expect(getAnimatingPlaceholder())
                .toBe(RANDOM_MEETING.slice(0, 1));
        });

        it('shows one character at a time', () => {
            jest.advanceTimersByTime(animationStartDelay);

            for (let i = 0; i < RANDOM_MEETING.length; i++) {
                jest.advanceTimersByTime(100);
                expect(getAnimatingPlaceholder())
                    .toBe(RANDOM_MEETING.slice(0, i + 1));
            }
        });

        it('stops when a name is entered', () => {
            jest.advanceTimersByTime(animationStartDelay + animationRevealRate);

            setInputValue('any');

            expect(getAnimatingPlaceholder()).toBe('');

            // Advance timers by some length of time
            jest.advanceTimersByTime(animationStartDelay + animationRevealRate);

            expect(getAnimatingPlaceholder()).toBe('');
        });

        it('resumes when an entered name is cleared and input blurred', () => {
            jest.advanceTimersByTime(animationStartDelay + animationRevealRate);

            setInputValue('any');

            expect(getAnimatingPlaceholder()).toBe('');

            setInputValue('');

            selfFillingNameEntry.find('input').simulate('blur');

            jest.advanceTimersByTime(animationStartDelay + animationRevealRate);

            expect(getAnimatingPlaceholder()).toBe(RANDOM_MEETING[0]);
        });
    });

    describe('on submit', () => {
        /**
         * Triggers submitting the entered meeting name.
         *
         * @returns {void}
         */
        function submit() {
            selfFillingNameEntry.find('input').simulate('submit');
        }

        describe('with no name entered', () => {
            it('provides a random name if one has not been generated', () => {
                submit();
                expect(onSubmitCallback).toHaveBeenCalledWith(RANDOM_MEETING);
            });

            it('provides the random name being animated', () => {
                jest.advanceTimersByTime(animationStartDelay);

                submit();
                expect(onSubmitCallback).toHaveBeenCalledWith(RANDOM_MEETING);
            });
        });

        describe('with a name entered', () => {
            it('provides the entered name', () => {
                const TEST_INPUT = 'test-meeting-name';

                setInputValue(TEST_INPUT);
                submit();
                expect(onSubmitCallback).toHaveBeenCalledWith(TEST_INPUT);
            });
        });
    });
});
