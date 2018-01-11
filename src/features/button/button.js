import PropTypes from 'prop-types';
import React from 'react';

import styles from './button.css';

export default class Clock extends React.Component {
    static propTypes = {
        children: PropTypes.any,
        onClick: PropTypes.func,
        text: PropTypes.string
    }

    render() {
        return (
            <button
                { ...this.props }
                className = { styles.button }
                onClick = { this.props.onClick }>
                { this.props.children }
            </button>
        );
    }
}
