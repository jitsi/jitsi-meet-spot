import PropTypes from 'prop-types';
import React from 'react';

import { Button } from 'features/button';

/**
 * A component for display a welcome message during setup.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function Welcome({ onSuccess }) {
    return (
        <div className = 'setup-step'>
            <h2 className = 'setup-title'>
                Welcome To Spot
            </h2>
            <div className = 'setup-content' />
            <div className = 'setup-buttons'>
                <Button onClick = { onSuccess }>
                    Next
                </Button>
            </div>
        </div>
    );
}

Welcome.propTypes = {
    onSuccess: PropTypes.func.isRequired
};
