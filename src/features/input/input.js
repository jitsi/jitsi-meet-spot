import PropTypes from 'prop-types';
import React from 'react';

import styles from './input.css';

export default function Input(props) {
    return (
        <input
            autoComplete = 'off'
            autoCorrect = 'off'
            className = { styles.input }
            id = { props.id }
            onChange = { props.onChange }
            placeholder = { props.placeholder }
            spellCheck = 'false'
            value = { props.value } />
    );
}

Input.propTypes = {
    id: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    value: PropTypes.string
};
