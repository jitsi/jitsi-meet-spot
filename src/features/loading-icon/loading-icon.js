import PropTypes from 'prop-types';
import React from 'react';

import styles from './loading-icon.css';

export default class LoadingIcon extends React.Component {
    static defaultProps = {
        color: 'black'
    };

    static propTypes = {
        color: PropTypes.string
    };

    render() {
        return (
            <div
                className = { styles.loading }
                style = {{ color: this.props.color }}>
                <div>.</div>
                <div>.</div>
                <div>.</div>
            </div>
        );
    }
}
