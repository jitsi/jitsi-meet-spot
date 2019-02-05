import PropTypes from 'prop-types';
import React from 'react';

import { Button } from 'features/button';

/**
 * A component for a button that displays the passed in video mute state.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function AudioMuteButton({ isMuted, onClick }) {
    return (
        <div
            className = 'remote-selection'
            onClick = { onClick }>
            <Button className = 'remote-button'>
                <i className = 'material-icons'>
                    { isMuted ? 'mic_off' : 'mic' }
                </i>
            </Button>
            <span>{ isMuted ? 'Mic Unmute' : 'Mic Mute' }</span>
        </div>
    );
}

AudioMuteButton.propTypes = {
    isMuted: PropTypes.bool,
    onClick: PropTypes.func.isRequired
};
