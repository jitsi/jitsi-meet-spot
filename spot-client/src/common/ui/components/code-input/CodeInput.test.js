import { mount } from 'enzyme';
import React from 'react';

import CodeInput from './CodeInput';

describe('CodeInput', () => {
    let codeInput, onChangeSpy;

    beforeEach(() => {
        onChangeSpy = jest.fn();
        codeInput = mount(<CodeInput onChange = { onChangeSpy } />);

        codeInput.find('.code-entry').simulate('click');
    });

    /**
     * Updates what value has been entered into CodeInput.
     *
     * @param {string} value - The new entered value.
     * @private
     * @returns {void}
     */
    function setValue(value) {
        const input = codeInput.find('input');

        input.at(0).instance().value = value;
        input.simulate('change');
    }

    test('notifies of value change', () => {
        setValue('t');

        expect(onChangeSpy).toHaveBeenCalledWith('t');

        setValue('te');

        expect(onChangeSpy).toHaveBeenCalledWith('te');
    });

    test('displays the entered value', () => {
        setValue('abcdef');

        const displayedValue = codeInput
            .find('.box')
            .reduce((acc, box) => acc + box.text(), '');

        expect(displayedValue).toEqual('abcdef');
    });
});
