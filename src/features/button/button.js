import PropTypes from 'prop-types';
import React from 'react';

import styles from './button.css';

export default function Button(props) {
    return (
        <button
            { ...props }
            className = { `${styles.button} ${props.className}` }>
            { props.children }
        </button>
    );
}

Button.defaultProps = {
    className: ''
};

Button.propTypes = {
    children: PropTypes.any,
    className: PropTypes.string,
    onClick: PropTypes.func
};
