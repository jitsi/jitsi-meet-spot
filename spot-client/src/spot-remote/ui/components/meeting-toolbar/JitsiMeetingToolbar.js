import React from 'react';

import { MoreButton } from './../more';
import { ScreenshareButton } from './../screenshare';
import {
    AudioMuteButton,
    HangupButton,
    RaiseHandButton,
    VideoMuteButton
} from './buttons';

/**
 * A component for showing in-meeting controls for a Spot-Remote to control
 * the Jitsi meeting on the Spot-TV.
 *
 * @returns {ReactElement}
 */
export default function JitsiMeetingToolbar() {
    return (
        <div className = 'in-call-nav-container'>
            <div className = 'in-call-nav'>
                <VideoMuteButton />
                <AudioMuteButton />
                <HangupButton />
            </div>
            <div className = 'in-call-nav'>
                <ScreenshareButton />
                <RaiseHandButton />
                <MoreButton />
            </div>
        </div>
    );
}
