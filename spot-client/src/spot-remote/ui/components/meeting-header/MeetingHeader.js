import PropTypes from 'prop-types';
import React from 'react';

import { RoomName } from 'common/ui';
import { parseMeetingUrl } from 'common/utils';

/**
 * Displays current meeting information.
 *
 * @extends React.Component
 */
export default class MeetingHeader extends React.Component {
    static propTypes = {
        invitedPhoneNumber: PropTypes.string,
        meetingDisplayName: PropTypes.string,
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
            meetingDisplayName,
            meetingUrl
        } = this.props;
        const { host, meetingName, path } = parseMeetingUrl(meetingUrl);

        return (
            <div className = 'view-header'>
                <RoomName />
                { invitedPhoneNumber && <div className = 'in-call-invited-phone'>{ invitedPhoneNumber }</div> }
                <div className = { invitedPhoneNumber ? 'in-call-name-with-phone' : 'in-call-name' } >
                    { meetingDisplayName || meetingName }
                </div>
                <div className = 'in-call-meeting-url' >
                    { `${host}${path}/${meetingName}` }
                </div>
            </div>
        );
    }
}
