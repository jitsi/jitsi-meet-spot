import React from 'react';

import {
    AudioMuteButton,
    HangupButton,
    VideoMuteButton
} from './buttons';

/**
 * Displays a toolbar for sending in-meeting commands to the Spot-TV.
 *
 * @returns {ReactElement}
 */
export default function ZoomMeetingToolbar() {
    return (
        <div className = 'in-call-nav'>
            <AudioMuteButton />
            <HangupButton />
            <VideoMuteButton />
        </div>
    );
}
