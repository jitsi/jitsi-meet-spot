import PropTypes from 'prop-types';
import React from 'react';

import styles from './view.css';

export default class View extends React.Component {
    static propTypes = {
        children: PropTypes.node
    };

    render() {
        return (
            <div className = { styles.view }>
                { this.props.children }
            </div>
        );
    }
}
