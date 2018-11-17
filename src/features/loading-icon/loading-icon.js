import PropTypes from 'prop-types';
import React from 'react';

import styles from './loading-icon.css';

/**
 * A component indicating loading is occurring.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function LoadingIcon(props) {
    return (
        <div
            className = { styles.loading }
            style = {{ color: props.color }}>
            <div>.</div>
            <div>.</div>
            <div>.</div>
        </div>
    );
}

LoadingIcon.defaultProps = {
    color: 'black'
};

LoadingIcon.propTypes = {
    color: PropTypes.string
};
