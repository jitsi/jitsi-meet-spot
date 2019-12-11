import React, { Component } from 'react';

import { isZoomMeetingUrl } from 'common/utils';

import AbstractMeetingFrame from './AbstractMeetingFrame';
import { JitsiMeetingFrame } from './JitsiMeetingFrame';
import { ZoomMeetingFrame } from './ZoomMeetingFrame';


/**
 * Displays the appropriate iFrame for displaying the current meeting.
 *
 * @extends React.Component
 */
export class MeetingFrame extends Component {
    static propTypes = AbstractMeetingFrame.propTypes;

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        if (isZoomMeetingUrl(this.props.meetingUrl)) {
            return <ZoomMeetingFrame { ...this.props } />;
        }

        return <JitsiMeetingFrame { ...this.props } />;
    }
}

export default MeetingFrame;
