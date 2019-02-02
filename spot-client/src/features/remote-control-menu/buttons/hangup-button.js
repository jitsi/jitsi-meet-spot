import PropTypes from 'prop-types';
import React from 'react';

import { Button } from 'features/button';

/**
 * A component for a button intended for leaving a meeting in progress.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function HangupButton({ onClick }) {
    return (
        <div
            className = 'remote-selection'
            onClick = { onClick }>
            <Button className = 'remote-hangup remote-button'>
                <div className = 'icon-hangup' />
            </Button>
            <span>Hang up</span>
        </div>
    );
}

HangupButton.propTypes = {
    onClick: PropTypes.func.isRequired
};
