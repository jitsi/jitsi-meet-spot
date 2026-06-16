import { mockT } from 'common/test-mocks';
import * as utils from 'common/utils';
import { act, fireEvent, render } from '@testing-library/react';
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

    // When no animating placeholder is set and there is no tenant, the input
    // falls back to displaying the 'adhoc.enterName' translation key.
    const EMPTY_PLACEHOLDER = 'adhoc.enterName';

    let onSubmitCallback: jest.Mock;
    let randomNameSpy: jest.SpyInstance;
    let container: HTMLElement;
    let unmount: () => void;

    beforeEach(() => {
        jest.useFakeTimers();

        randomNameSpy = jest.spyOn(utils, 'getRandomMeetingName');
        randomNameSpy.mockReturnValue(RANDOM_MEETING);

        onSubmitCallback = jest.fn();

        ({ container, unmount } = render(
            <SelfFillingNameEntry
                onSubmit = { onSubmitCallback }
                t = { mockT } />
        ));
    });

    afterEach(() => {
        unmount();
    });

    /**
     * Returns the meeting name input element.
     *
     * @private
     * @returns {HTMLInputElement}
     */
    function getInput(): HTMLInputElement {
        return container.querySelector('input') as HTMLInputElement;
    }

    /**
     * Sets the entered meeting name.
     *
     * @param newValue - The entered value to set in the input.
     * @private
     * @returns {void}
     */
    function setInputValue(newValue: string) {
        fireEvent.change(getInput(), { target: { value: newValue } });
    }

    /**
     * Returns the current animating placeholder as reflected by the rendered
     * input. The component renders the animating placeholder as the input's
     * placeholder attribute; when there is no animating placeholder the input
     * falls back to the 'adhoc.enterName' translation key.
     *
     * @private
     * @returns {string}
     */
    function getAnimatingPlaceholder(): string {
        const placeholder = getInput().getAttribute('placeholder');

        return placeholder === EMPTY_PLACEHOLDER ? '' : placeholder ?? '';
    }

    describe('animated name display', () => {
        it('starts after a delay', () => {
            act(() => {
                jest.advanceTimersByTime(animationStartDelay - 1);
            });

            expect(getAnimatingPlaceholder()).toBe('');

            act(() => {
                jest.advanceTimersByTime(animationRevealRate + 1);
            });

            expect(getAnimatingPlaceholder())
                .toBe(RANDOM_MEETING.slice(0, 1));
        });

        it('shows one character at a time', () => {
            act(() => {
                jest.advanceTimersByTime(animationStartDelay);
            });

            for (let i = 0; i < RANDOM_MEETING.length; i++) {
                act(() => {
                    jest.advanceTimersByTime(100);
                });
                expect(getAnimatingPlaceholder())
                    .toBe(RANDOM_MEETING.slice(0, i + 1));
            }
        });

        it('stops when a name is entered', () => {
            act(() => {
                jest.advanceTimersByTime(animationStartDelay + animationRevealRate);
            });

            setInputValue('any');

            expect(getAnimatingPlaceholder()).toBe('');

            // Advance timers by some length of time
            act(() => {
                jest.advanceTimersByTime(animationStartDelay + animationRevealRate);
            });

            expect(getAnimatingPlaceholder()).toBe('');
        });

        it('resumes when an entered name is cleared and input blurred', () => {
            act(() => {
                jest.advanceTimersByTime(animationStartDelay + animationRevealRate);
            });

            setInputValue('any');

            expect(getAnimatingPlaceholder()).toBe('');

            setInputValue('');

            fireEvent.blur(getInput());

            act(() => {
                jest.advanceTimersByTime(animationStartDelay + animationRevealRate);
            });

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
            fireEvent.submit(getInput());
        }

        describe('with no name entered', () => {
            it('provides a random name if one has not been generated', () => {
                submit();
                expect(onSubmitCallback).toHaveBeenCalledWith(RANDOM_MEETING);
            });

            it('provides the random name being animated', () => {
                act(() => {
                    jest.advanceTimersByTime(animationStartDelay);
                });

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
