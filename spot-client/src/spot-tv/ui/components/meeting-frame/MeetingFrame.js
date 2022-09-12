import React, { Component } from 'react';

import AbstractMeetingFrame from './AbstractMeetingFrame';
import { JitsiMeetingFrame } from './JitsiMeetingFrame';


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
        return <JitsiMeetingFrame { ...this.props } />;
    }
}

export default MeetingFrame;
