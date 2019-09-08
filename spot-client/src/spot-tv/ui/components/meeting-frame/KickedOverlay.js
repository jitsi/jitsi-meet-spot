import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import { Countdown, StatusOverlay } from 'common/ui';

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
        <StatusOverlay title = { t('appStatus.kicked') }>
            <div>{ t('appStatus.redirectingHome') }</div>
            <Countdown onCountdownComplete = { onRedirect } />
        </StatusOverlay>
    );
}

KickedOverlay.propTypes = {
    onRedirect: PropTypes.func,
    t: PropTypes.func
};

export default withTranslation()(KickedOverlay);
