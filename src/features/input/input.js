import PropTypes from 'prop-types';
import React from 'react';

import styles from './input.css';

export class Input extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        placeholder: PropTypes.string,
        onChange: PropTypes.func,
        value: PropTypes.string
    };

    render() {
        return (
            <input
                autoComplete = 'off'
                autoCorrect = 'off'
                className = { styles.input }
                id = { this.props.id }
                onChange = { this.props.onChange }
                placeholder = { this.props.placeholder }
                spellCheck = 'false'
                value = { this.props.value } />
        );
    }
}

export default Input;
