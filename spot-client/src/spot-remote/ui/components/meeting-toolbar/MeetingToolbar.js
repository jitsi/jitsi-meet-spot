import PropTypes from 'prop-types';
import React from 'react';
import { isZoomMeetingUrl } from 'common/utils';

import JitsiMeetingToolbar from './JitsiMeetingToolbar';
import ZoomMeetingToolbar from './ZoomMeetingToolbar';

/**
 * A component for showing in-meeting controls for a Spot-Remote to control
 * the meeting on the Spot-TV.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function MeetingToolbar(props) {
    if (isZoomMeetingUrl(props.meetingUrl)) {
        return <ZoomMeetingToolbar />;
    }

    return <JitsiMeetingToolbar />;
}

MeetingToolbar.propTypes = {
    meetingUrl: PropTypes.string
};
