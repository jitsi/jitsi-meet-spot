import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getInMeetingStatus } from 'common/app-state';
import { RoomName } from 'common/ui';
import { parseMeetingUrl } from 'common/utils';

/**
 * Displays current meeting information.
 *
 * @extends React.Component
 */
export class MeetingHeader extends React.Component {
    static propTypes = {
        invitedPhoneNumber: PropTypes.string,
        meetingUrl: PropTypes.string
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            invitedPhoneNumber,
            meetingUrl
        } = this.props;
        const { host, meetingName, path } = parseMeetingUrl(meetingUrl);

        return (
            <div className = 'view-header'>
                <RoomName />
                { invitedPhoneNumber && <div className = 'in-call-invited-phone'>{ invitedPhoneNumber }</div> }
                <div className = { invitedPhoneNumber ? 'in-call-name-with-phone' : 'in-call-name' } >
                    { meetingName }
                </div>
                <div className = 'in-call-meeting-url' >
                    { `${host}${path}/${meetingName}` }
                </div>
            </div>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code MeetingHeader}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    const { inMeeting } = getInMeetingStatus(state);

    return {
        inMeeting
    };
}

export default connect(mapStateToProps)(MeetingHeader);
