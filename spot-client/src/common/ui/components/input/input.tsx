import { Input as MaterialInput } from '@mui/material';
import React from 'react';

const classes = {
    focused: 'input-focused',
    input: 'input-field',
    root: 'input',
    underline: 'input-underline'
};

const inputProps = {
    autoCapitalize: 'off',
    autoComplete: 'off',
    autoCorrect: 'off',
    spellCheck: false
};

interface IInputProps {
    'data-qa-id'?: string;
    gradientStart?: string;
    id?: string;
    inputProps?: Record<string, any>;
    onBlur?: (...args: any[]) => void;
    onChange?: (...args: any[]) => void;
    onFocus?: (...args: any[]) => void;
    placeholder?: string;
    value?: string;
}

/**
 * A component for a configured and styled {@code HTMLInputElement}.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns
 */
export default function Input(props: IInputProps) {
    const gradientStart = props.gradientStart ?? 'left';
    const className = `gradient-start-${gradientStart}`;

    return (
        <MaterialInput
            className = { className }
            classes = { classes }
            data-qa-id = { props['data-qa-id'] }
            fullWidth = { true }
            id = { props.id }
            inputProps = {{
                ...inputProps,
                ...props.inputProps
            }}
            onBlur = { props.onBlur }
            onChange = { props.onChange }
            onFocus = { props.onFocus }
            placeholder = { props.placeholder }
            value = { props.value } />
    );
}
