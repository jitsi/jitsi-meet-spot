import React from 'react';

import styles from './loading-icon.css';

export default class LoadingIcon extends React.Component {
    render() {
        return (
            <div className = { styles.loading }>
                <div>.</div>
                <div>.</div>
                <div>.</div>
            </div>
        );
    }
}
