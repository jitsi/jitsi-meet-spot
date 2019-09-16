import React from 'react';
import { mount } from 'enzyme';

import DialPad from './dial-pad';

describe('DialPad', () => {
    let dialPad, submitCallback;

    beforeEach(() => {
        submitCallback = jest.fn();
        dialPad = mount(<DialPad onSubmit = { submitCallback } />);
    });

    afterEach(() => {
        dialPad.unmount();
    });

    test('entering a number with a mouse', () => {
        dialPad.find(`#dial-button-${2}`).simulate('mousedown');
        dialPad.find(`#dial-button-${2}`).simulate('mousedown');
        dialPad.find(`#dial-button-${2}`).simulate('mousedown');

        dialPad.find(`#dial-button-${3}`).simulate('mousedown');
        dialPad.find(`#dial-button-${3}`).simulate('mousedown');
        dialPad.find(`#dial-button-${3}`).simulate('mousedown');

        dialPad.find(`#dial-button-${4}`).simulate('mousedown');
        dialPad.find(`#dial-button-${4}`).simulate('mousedown');
        dialPad.find(`#dial-button-${4}`).simulate('mousedown');
        dialPad.find(`#dial-button-${4}`).simulate('mousedown');

        expect(dialPad.find('input').instance().value).toBe('(222) 333-4444');
    });

    test('entering a number with touch', () => {
        dialPad.find(`#dial-button-${2}`).simulate('touchstart');
        dialPad.find(`#dial-button-${2}`).simulate('touchstart');
        dialPad.find(`#dial-button-${2}`).simulate('touchstart');

        dialPad.find(`#dial-button-${3}`).simulate('touchstart');
        dialPad.find(`#dial-button-${3}`).simulate('touchstart');
        dialPad.find(`#dial-button-${3}`).simulate('touchstart');

        dialPad.find(`#dial-button-${4}`).simulate('touchstart');
        dialPad.find(`#dial-button-${4}`).simulate('touchstart');
        dialPad.find(`#dial-button-${4}`).simulate('touchstart');
        dialPad.find(`#dial-button-${4}`).simulate('touchstart');

        expect(dialPad.find('input').instance().value).toBe('(222) 333-4444');
    });

    test('formats international phone numbers', () => {
        // Long press on 0 to produce +
        jest.useFakeTimers();
        dialPad.find('#dial-button-0').simulate('mousedown');
        jest.runAllTimers();

        dialPad.find(`#dial-button-${4}`).simulate('touchstart');
        dialPad.find(`#dial-button-${4}`).simulate('touchstart');

        dialPad.find(`#dial-button-${5}`).simulate('touchstart');
        dialPad.find(`#dial-button-${5}`).simulate('touchstart');

        dialPad.find(`#dial-button-${6}`).simulate('touchstart');
        dialPad.find(`#dial-button-${6}`).simulate('touchstart');
        dialPad.find(`#dial-button-${6}`).simulate('touchstart');
        dialPad.find(`#dial-button-${6}`).simulate('touchstart');

        dialPad.find(`#dial-button-${7}`).simulate('touchstart');
        dialPad.find(`#dial-button-${7}`).simulate('touchstart');
        dialPad.find(`#dial-button-${7}`).simulate('touchstart');
        dialPad.find(`#dial-button-${7}`).simulate('touchstart');

        expect(dialPad.find('input').instance().value).toBe('+44 55 6666 7777');
    });

    test('deleting numbers', () => {
        dialPad.find(`#dial-button-${2}`).simulate('mousedown');
        dialPad.find(`#dial-button-${2}`).simulate('mousedown');
        dialPad.find(`#dial-button-${2}`).simulate('mousedown');

        dialPad.find('.backspace').simulate('click');
        expect(dialPad.find('input').instance().value).toBe('22');

        dialPad.find('.backspace').simulate('click');
        expect(dialPad.find('input').instance().value).toBe('2');

        dialPad.find('.backspace').simulate('click');
        expect(dialPad.find('input').instance().value).toBe('');
    });

    test('submitting a valid phone number in the E.164 format', () => {
        dialPad.find(`#dial-button-${2}`).simulate('touchstart');
        dialPad.find(`#dial-button-${3}`).simulate('touchstart');
        dialPad.find(`#dial-button-${4}`).simulate('touchstart');

        dialPad.find(`#dial-button-${3}`).simulate('touchstart');
        dialPad.find(`#dial-button-${3}`).simulate('touchstart');
        dialPad.find(`#dial-button-${3}`).simulate('touchstart');

        dialPad.find(`#dial-button-${4}`).simulate('touchstart');
        dialPad.find(`#dial-button-${4}`).simulate('touchstart');
        dialPad.find(`#dial-button-${4}`).simulate('touchstart');
        dialPad.find(`#dial-button-${4}`).simulate('touchstart');

        dialPad.find('button.call-button').simulate('click');

        expect(submitCallback).toHaveBeenCalledWith(expect.any(String), '+12343334444');
    });

    test('not submitting the form if the phone number is invalid', () => {
        dialPad.find('#dial-button-1').simulate('mousedown');
        dialPad.find('button.call-button').simulate('click');

        expect(submitCallback).not.toHaveBeenCalled();
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
