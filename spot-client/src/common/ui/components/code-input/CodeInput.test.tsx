import { ReactWrapper, mount } from 'enzyme';
import React from 'react';

import CodeInput from './CodeInput';

describe('CodeInput', () => {
    let codeInput: ReactWrapper;
    let onChangeSpy: jest.Mock;

    beforeEach(() => {
        onChangeSpy = jest.fn();
        codeInput = mount(<CodeInput onChange = { onChangeSpy } />);

        codeInput.find('.code-entry').simulate('click');
    });

    /**
     * Updates what value has been entered into CodeInput.
     *
     * @param value - The new entered value.
     * @private
     * @returns {void}
     */
    function setValue(value: string) {
        const input = codeInput.find('.hidden-user-input');

        (input.at(0).instance() as unknown as HTMLInputElement).value = value;
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
            .reduce((acc: string, box) => acc + box.text(), '');

        expect(displayedValue).toEqual('abcdef');
    });
});
