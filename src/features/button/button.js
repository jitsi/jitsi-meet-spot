import PropTypes from 'prop-types';
import React from 'react';

import styles from './button.css';

export default class Clock extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        children: PropTypes.any,
        onClick: PropTypes.func,
        text: PropTypes.string
    }

    render() {
        return (
            <button
                { ...this.props }
                className = { `${styles.button} ${this.props.className || ''}` }
                onClick = { this.props.onClick }>
                { this.props.children }
            </button>
        );
    }
}
