import PropTypes from 'prop-types';
import React from 'react';

/**
 * Displays a button within the nav.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function NavItem({ id, active, children, label, onClick, qaId }) {
    const className = `nav-item ${active ? 'active' : ''}`;

    return (
        <button
            className = { className }
            data-qa-id = { qaId }
            id = { id }
            onClick = { onClick }
            type = 'button'>
            <div className = 'nav-item-content'>
                { children }
            </div>
            <div className = 'nav-item-label'>
                { label }
            </div>
        </button>
    );
}

NavItem.propTypes = {
    active: PropTypes.bool,
    children: PropTypes.node,
    id: PropTypes.string,
    label: PropTypes.string,
    onClick: PropTypes.func,
    qaId: PropTypes.string
};
