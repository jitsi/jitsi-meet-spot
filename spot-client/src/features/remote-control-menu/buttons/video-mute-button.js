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
export default function VideoMuteButton({ isMuted, onClick }) {
    return (
        <div
            className = 'remote-selection'
            onClick = { onClick }>
            <Button className = 'remote-button'>
                <i className = 'material-icons'>
                    { isMuted ? 'videocam_off' : 'videocam' }
                </i>
            </Button>
            <span>{ isMuted ? 'Video Unmute' : 'Video Mute'}</span>
        </div>
    );
}

VideoMuteButton.propTypes = {
    isMuted: PropTypes.bool,
    onClick: PropTypes.func.isRequired
};
