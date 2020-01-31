import PropTypes from 'prop-types';
import React from 'react';

/**
 * Implements a component that renders an admin modal entry.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function AdminEntry(props) {
    return (
        <div className = 'admin-entry'>
            <div className = 'admin-entry-title'>
                { props.entryLabel }
            </div>
            <div className = 'admin-entry-content'>
                { props.children }
            </div>
        </div>
    );
}

AdminEntry.propTypes = {
    children: PropTypes.any,
    entryLabel: PropTypes.string
};
