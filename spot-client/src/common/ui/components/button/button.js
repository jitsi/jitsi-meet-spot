import PropTypes from 'prop-types';
import React from 'react';

/**
 * A component for a styled {@code HTMLButtonElement}.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function Button(props) {
    return (
        <button
            { ...props }
            className = { `button ${props.type} ${props.className}` }>
            { props.children }
        </button>
    );
}

Button.defaultProps = {
    className: '',
    type: 'accept'
};

Button.propTypes = {
    children: PropTypes.any,
    className: PropTypes.string,
    'data-qa-id': PropTypes.string,
    onClick: PropTypes.func,
    type: PropTypes.string
};
