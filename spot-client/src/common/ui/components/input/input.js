import { Input as MaterialInput } from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';

const classes = {
    focused: 'input-focused',
    input: 'input-field',
    root: 'input',
    underline: 'input-underline'
};

/**
 * A component for a configured and styled {@code HTMLInputElement}.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function Input(props) {
    const className = `gradient-start-${props.gradientStart}`;

    return (
        <MaterialInput
            autoComplete = 'off'
            autoCorrect = 'off'
            className = { className }
            classes = { classes }
            data-qa-id = { props['data-qa-id'] }
            fullWidth = { true }
            id = { props.id }
            onBlur = { props.onBlur }
            onChange = { props.onChange }
            onFocus = { props.onFocus }
            placeholder = { props.placeholder }
            spellCheck = 'false'
            value = { props.value } />
    );
}

Input.defaultProps = {
    gradientStart: 'left'
};

Input.propTypes = {
    'data-qa-id': PropTypes.string,
    gradientStart: PropTypes.string,
    id: PropTypes.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    placeholder: PropTypes.string,
    value: PropTypes.string
};
