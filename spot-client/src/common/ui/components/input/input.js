import PropTypes from 'prop-types';
import React from 'react';

/**
 * A component for a configured and styled {@code HTMLInputElement}.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function Input(props) {
    return (
        <input
            autoComplete = 'off'
            autoCorrect = 'off'
            className = 'base-input'
            data-qa-id = { props['data-qa-id'] }
            id = { props.id }
            onBlur = { props.onBlur }
            onChange = { props.onChange }
            onFocus = { props.onFocus }
            placeholder = { props.placeholder }
            spellCheck = 'false'
            value = { props.value } />
    );
}

Input.propTypes = {
    'data-qa-id': PropTypes.string,
    id: PropTypes.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    placeholder: PropTypes.string,
    value: PropTypes.string
};
