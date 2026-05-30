import React, { Component } from 'react';

import { JitsiMeetingFrame } from './JitsiMeetingFrame';

interface IProps {
    displayName?: string;
    dtmfThrottleRate?: number;
    invites?: any[];
    jitsiAppName?: string;
    jwt?: string;
    maxDesktopSharingFramerate?: number;
    meetingDisplayName?: string;
    meetingJoinTimeout?: number;
    meetingUrl?: string;
    minDesktopSharingFramerate?: number;
    onMeetingLeave?: (...args: any[]) => void;
    onMeetingStart?: (...args: any[]) => void;
    preferredCamera?: string;
    preferredMic?: string;
    preferredResolution?: string;
    preferredSpeaker?: string;
    remoteControlServer?: any;
    screenshareDevice?: string;
    startWithScreenshare?: boolean;
    startWithVideoMuted?: boolean;
    updateSpotTvState?: (...args: any[]) => void;
}

/**
 * Displays the appropriate iFrame for displaying the current meeting.
 */
export class MeetingFrame extends Component<IProps> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return <JitsiMeetingFrame { ...this.props } />;
    }
}

export default MeetingFrame;
