import { Countdown, StatusOverlay } from 'common/ui';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';


/**
 * Renders a text overlay which hides Jitsi-Meet iFrame when the local
 * participant has been removed from the meeting.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactNode}
 */
export function KickedOverlay({ onRedirect, t }) {
    return (
        <StatusOverlay title = { t('conferenceStatus.kicked') }>
            <div>{ t('conferenceStatus.exitingConference') }</div>
            <Countdown onCountdownComplete = { onRedirect } />
        </StatusOverlay>
    );
}

KickedOverlay.propTypes = {
    onRedirect: PropTypes.func,
    t: PropTypes.func
};

export default withTranslation()(KickedOverlay);
