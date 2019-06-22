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

    test('entering a number', () => {
        for (let i = 1; i < 4; i++) {
            dialPad.find(`#dial-button-${i}`).simulate('click');
        }

        expect(dialPad.find('input').instance().value).toBe('123');
    });

    test('deleting numbers', () => {
        for (let i = 1; i < 4; i++) {
            dialPad.find(`#dial-button-${i}`).simulate('click');
        }

        dialPad.find('.backspace').simulate('click');
        expect(dialPad.find('input').instance().value).toBe('12');

        dialPad.find('.backspace').simulate('click');
        expect(dialPad.find('input').instance().value).toBe('1');

        dialPad.find('.backspace').simulate('click');
        expect(dialPad.find('input').instance().value).toBe('');
    });

    test('submitting the entered number', () => {
        dialPad.find('#dial-button-1').simulate('click');
        dialPad.find('button.call-button').simulate('click');

        expect(submitCallback).toHaveBeenCalledWith(expect.any(String), '1');
    });

    test('submitting without a number', () => {
        dialPad.find('button.call-button').simulate('click');

        expect(submitCallback).toHaveBeenCalledWith(expect.any(String), '');
    });
});
