import PropTypes from 'prop-types';
import React from 'react';

/**
 * Displays a status message while covering the entire screen.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function StatusOverlay(props) {
    return (
        <div className = 'status-overlay'>
            <div className = 'status-overlay-text-frame'>
                <h1>{ props.title }</h1>
                <div className = 'status-overlay-text'>
                    { props.children }
                </div>
            </div>
        </div>
    );
}

StatusOverlay.propTypes = {
    children: PropTypes.node,
    title: PropTypes.string
};
