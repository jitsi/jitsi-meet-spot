import PropTypes from 'prop-types';
import React from 'react';

import JitsiMeetingToolbar from './JitsiMeetingToolbar';

/**
 * A component for showing in-meeting controls for a Spot-Remote to control
 * the meeting on the Spot-TV.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function MeetingToolbar(props) { // eslint-disable-line no-unused-vars
    return <JitsiMeetingToolbar />;
}

MeetingToolbar.propTypes = {
    meetingUrl: PropTypes.string
};
