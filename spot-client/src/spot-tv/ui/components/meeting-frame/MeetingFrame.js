import React, { Component } from 'react';

import { JitsiMeetingFrame } from './JitsiMeetingFrame';
import meetingFramePropTypes from './meetingFramePropTypes';

/**
 * Displays the appropriate iFrame for displaying the current meeting.
 *
 * @extends React.Component
 */
export default class MeetingFrame extends Component {
    static propTypes = meetingFramePropTypes;

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
