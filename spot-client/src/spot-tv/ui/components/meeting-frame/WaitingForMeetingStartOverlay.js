import { StatusOverlay } from 'common/ui';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';


/**
 * Renders a text overlay which hides meeting frame when actively attempting to
 * join a meeting that has yet to begun so it cannot be joined.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function WaitingForMeetingStartOverlay({ t }) {
    return (
        <StatusOverlay title = { t('conferenceStatus.meetingNotStarted') }>
            <div>{ t('conferenceStatus.waitingForStart') }</div>
        </StatusOverlay>
    );
}

WaitingForMeetingStartOverlay.propTypes = {
    t: PropTypes.func
};

export default withTranslation()(WaitingForMeetingStartOverlay);
