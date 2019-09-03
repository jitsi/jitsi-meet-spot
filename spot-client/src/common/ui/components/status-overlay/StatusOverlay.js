import PropTypes from 'prop-types';
import React from 'react';

import { Background } from './../background';

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
            { props.showBackground && <Background /> }
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
    showBackground: PropTypes.bool,
    title: PropTypes.string
};
