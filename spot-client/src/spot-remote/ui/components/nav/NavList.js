import PropTypes from 'prop-types';
import React from 'react';

/**
 * Container for NavItems to be displayed.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function NavList({ children }) {
    return (
        <div className = 'nav-list'>
            { children }
        </div>
    );
}

NavList.propTypes = {
    children: PropTypes.node
};
