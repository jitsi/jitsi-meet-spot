import PropTypes from 'prop-types';
import React from 'react';

import styles from './input.css';

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
            className = { styles.input }
            data-qa-id = { props['data-qa-id'] }
            id = { props.id }
            onChange = { props.onChange }
            placeholder = { props.placeholder }
            spellCheck = 'false'
            value = { props.value } />
    );
}

Input.propTypes = {
    'data-qa-id': PropTypes.string,
    id: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    value: PropTypes.string
};
