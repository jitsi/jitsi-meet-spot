import { fireEvent, render } from '@testing-library/react';
import React from 'react';

import CodeInput from './CodeInput';

describe('CodeInput', () => {
    let container: HTMLElement;
    let onChangeSpy: jest.Mock;

    beforeEach(() => {
        onChangeSpy = jest.fn();
        ({ container } = render(<CodeInput onChange = { onChangeSpy } />));

        fireEvent.click(container.querySelector('.code-entry')!);
    });

    /**
     * Updates what value has been entered into CodeInput.
     *
     * @param value - The new entered value.
     * @private
     * @returns {void}
     */
    function setValue(value: string) {
        const input = container.querySelector('.hidden-user-input')!;

        fireEvent.change(input, { target: { value } });
    }

    test('notifies of value change', () => {
        setValue('t');

        expect(onChangeSpy).toHaveBeenCalledWith('t');

        setValue('te');

        expect(onChangeSpy).toHaveBeenCalledWith('te');
    });

    test('displays the entered value', () => {
        setValue('abcdef');

        const displayedValue = Array.from(container.querySelectorAll('.box'))
            .reduce((acc: string, box) => acc + box.textContent, '');

        expect(displayedValue).toEqual('abcdef');
    });
});
