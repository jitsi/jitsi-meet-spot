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
        for (let i = 1; i < 4; i++) {
            dialPad.find(`#dial-button-${i}`).simulate('mousedown');
        }

        expect(dialPad.find('input').instance().value).toBe('123');
    });

    test('entering a number with touch', () => {
        for (let i = 1; i < 4; i++) {
            dialPad.find(`#dial-button-${i}`).simulate('touchstart');
        }

        expect(dialPad.find('input').instance().value).toBe('123');
    });

    test('deleting numbers', () => {
        for (let i = 1; i < 4; i++) {
            dialPad.find(`#dial-button-${i}`).simulate('mousedown');
        }

        dialPad.find('.backspace').simulate('click');
        expect(dialPad.find('input').instance().value).toBe('12');

        dialPad.find('.backspace').simulate('click');
        expect(dialPad.find('input').instance().value).toBe('1');

        dialPad.find('.backspace').simulate('click');
        expect(dialPad.find('input').instance().value).toBe('');
    });

    test('submitting the entered number', () => {
        dialPad.find('#dial-button-1').simulate('mousedown');
        dialPad.find('button.call-button').simulate('click');

        expect(submitCallback).toHaveBeenCalledWith(expect.any(String), '1');
    });

    test('submitting without a number', () => {
        dialPad.find('button.call-button').simulate('click');

        expect(submitCallback).toHaveBeenCalledWith(expect.any(String), '');
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
