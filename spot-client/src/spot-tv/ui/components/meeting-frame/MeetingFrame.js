import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { isZoomEnabled } from 'common/app-state';
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
    static propTypes = {
        ...AbstractMeetingFrame.propTypes,
        allowZoomMeetings: PropTypes.bool
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            allowZoomMeetings,
            ...otherProps
        } = this.props;

        if (allowZoomMeetings && isZoomMeetingUrl(otherProps.meetingUrl)) {
            return <ZoomMeetingFrame { ...otherProps } />;
        }

        return <JitsiMeetingFrame { ...otherProps } />;
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code MeetingFrame}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        allowZoomMeetings: isZoomEnabled(state)
    };
}

export default connect(mapStateToProps)(MeetingFrame);
