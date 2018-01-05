import PropTypes from 'prop-types';
import React from 'react';

import styles from './button.css';

export default class Clock extends React.Component {
    static propTypes = {
        children: PropTypes.any,
        onClick: PropTypes.func,
        text: PropTypes.string
    }

    constructor(props) {
        super(props);

        this._onClick = this._onClick.bind(this);
    }

    render() {
        return (
            <button
                { ...this.props }
                className = { styles.button }
                onClick = { this._onClick }>
                { this.props.children }
            </button>
        );
    }

    _onClick() {
        this.props.onClick && this.props.onClick();
    }
}
