import { mount } from 'enzyme';
import React from 'react';

import { DialPad } from './dial-pad';

describe('DialPad', () => {
    let dialPad, submitCallback;

    beforeEach(() => {
        submitCallback = jest.fn();
        dialPad = mount(<DialPad onSubmit = { submitCallback } />);
    });

    afterEach(() => {
        dialPad.unmount();
    });

    /**
     * Click the call button on the dial pad. It's an async process so must be handled from the returned promise.
     *
     * @returns {Promise<void>}
     */
    function clickCallButton() {
        dialPad.find('button.call-button').simulate('click');

        return new Promise(resolve => process.nextTick(resolve));
    }

    /**
     * Runs through the digits in given string and simulates events on corresponding dial pad keys.
     *
     * @param {string} phoneNumber - The phone number digits(only numbers) to type.
     * @param {string} method - The method for pressing keys. Uses ' touchstart' by default.
     * @returns {void}
     */
    function typePhoneNumber(phoneNumber, method = 'touchstart') {
        for (const digit of phoneNumber) {
            dialPad.find(`#dial-button-${digit}`).simulate(method);
        }
    }

    test('entering a number with a mouse', () => {
        typePhoneNumber('2223334444', 'mousedown');

        expect(dialPad.find('input').instance().value).toBe('(222) 333-4444');
    });

    test('entering a number with touch', () => {
        typePhoneNumber('2223334444');

        expect(dialPad.find('input').instance().value).toBe('(222) 333-4444');
    });

    test('formats international phone numbers', () => {
        // Long press on 0 to produce +
        jest.useFakeTimers();
        dialPad.find('#dial-button-0').simulate('mousedown');
        jest.runAllTimers();

        typePhoneNumber('445566667777');

        expect(dialPad.find('input').instance().value).toBe('+44 55 6666 7777');
    });

    test('deleting numbers', () => {
        typePhoneNumber('222');

        dialPad.find('.backspace').simulate('mousedown');
        expect(dialPad.find('input').instance().value).toBe('22');

        dialPad.find('.backspace').simulate('mousedown');
        expect(dialPad.find('input').instance().value).toBe('2');

        dialPad.find('.backspace').simulate('mousedown');
        expect(dialPad.find('input').instance().value).toBe('');
    });

    test('submitting a valid phone number in the E.164 format', () => {
        typePhoneNumber('2343334444');

        dialPad.find('button.call-button').simulate('click');

        return clickCallButton().then(() => {
            expect(submitCallback).toHaveBeenCalledWith(expect.any(String), '+12343334444');
        });
    });

    test('not submitting the form if the phone number is invalid', () => {
        dialPad.find('#dial-button-1').simulate('mousedown');
        dialPad.find('button.call-button').simulate('click');

        return clickCallButton().then(() => {
            expect(submitCallback).not.toHaveBeenCalled();
        });
    });

    test('replaces 0 with + on long press', () => {
        jest.useFakeTimers();

        dialPad.find('#dial-button-1').simulate('mousedown');
        dialPad.find('#dial-button-0').simulate('mousedown');

        expect(dialPad.find('input').instance().value).toBe('10');

        jest.runAllTimers();

        expect(dialPad.find('input').instance().value).toBe('1+');
    });
});
