import { expect, jest } from '@jest/globals';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';

import { DialPad } from './dial-pad';

describe('DialPad', () => {
    let container: HTMLElement;
    let submitCallback: jest.Mock;
    let unmount: () => void;

    /**
     * Returns the current value of the dial pad input.
     *
     * @returns
     */
    function getInputValue(): string {
        return (container.querySelector('input') as HTMLInputElement).value;
    }

    /**
     * Finds the dial pad button for the given digit/character by its main value.
     *
     * @param digit - The main value displayed on the button to find.
     * @returns
     */
    function getDialButton(digit: string): HTMLButtonElement {
        const button = Array.from(container.querySelectorAll('.dial-button'))
            .find(b => b.querySelector('.main')?.textContent === digit);

        return button as HTMLButtonElement;
    }

    beforeEach(() => {
        submitCallback = jest.fn();
        ({ container, unmount } = render(
            <DialPad
                onCountryCodeSelected = { jest.fn() }
                onPhoneAuthorizeFailed = { jest.fn() }
                onSubmit = { submitCallback } />
        ));
    });

    afterEach(() => {
        unmount();
        cleanup();
    });

    /**
     * Click the call button on the dial pad. It's an async process so must be handled from the returned promise.
     *
     * @returns
     */
    function clickCallButton(): Promise<void> {
        fireEvent.click(container.querySelector('button.call-button') as HTMLButtonElement);

        return new Promise(resolve => process.nextTick(resolve));
    }

    /**
     * Runs through the digits in given string and simulates events on corresponding dial pad keys.
     *
     * @param phoneNumber - The phone number digits(only numbers) to type.
     * @param method - The method for pressing keys. Uses ' touchstart' by default.
     * @returns
     */
    function typePhoneNumber(phoneNumber: string, method = 'touchstart'): void {
        for (const digit of phoneNumber) {
            const button = getDialButton(digit);

            if (method === 'mousedown') {
                fireEvent.mouseDown(button);
            } else {
                fireEvent.touchStart(button);
            }
        }
    }

    test('entering a number with a mouse', () => {
        typePhoneNumber('2223334444', 'mousedown');

        expect(getInputValue()).toBe('(222) 333-4444');
    });

    test('entering a number with touch', () => {
        typePhoneNumber('2223334444');

        expect(getInputValue()).toBe('(222) 333-4444');
    });

    test('formats international phone numbers', () => {
        // Long press on 0 to produce +
        jest.useFakeTimers({ advanceTimers: true });
        fireEvent.mouseDown(getDialButton('0'));
        act(() => {
            jest.runAllTimers();
        });

        typePhoneNumber('445566667777');

        expect(getInputValue()).toBe('+44 55 6666 7777');
    });

    test('deleting numbers', () => {
        typePhoneNumber('222');

        fireEvent.mouseDown(container.querySelector('.backspace') as HTMLButtonElement);
        expect(getInputValue()).toBe('22');

        fireEvent.mouseDown(container.querySelector('.backspace') as HTMLButtonElement);
        expect(getInputValue()).toBe('2');

        fireEvent.mouseDown(container.querySelector('.backspace') as HTMLButtonElement);
        expect(getInputValue()).toBe('');
    });

    test('submitting a valid phone number in the E.164 format', () => {
        typePhoneNumber('2343334444');

        fireEvent.click(container.querySelector('button.call-button') as HTMLButtonElement);

        return clickCallButton().then(() => {
            expect(submitCallback).toHaveBeenCalledWith(expect.any(String), '+12343334444');
        });
    });

    test('not submitting the form if the phone number is invalid', () => {
        fireEvent.mouseDown(getDialButton('1'));
        fireEvent.click(container.querySelector('button.call-button') as HTMLButtonElement);

        return clickCallButton().then(() => {
            expect(submitCallback).not.toHaveBeenCalled();
        });
    });

    test('replaces 0 with + on long press', () => {
        jest.useFakeTimers({ advanceTimers: true });

        fireEvent.mouseDown(getDialButton('1'));
        fireEvent.mouseDown(getDialButton('0'));

        expect(getInputValue()).toBe('10');

        act(() => {
            jest.runAllTimers();
        });

        expect(getInputValue()).toBe('1+');
    });
});
