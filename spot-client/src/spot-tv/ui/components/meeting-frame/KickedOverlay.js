import PropTypes from 'prop-types';
import React from 'react';

import { Countdown, StatusOverlay } from 'common/ui';

/**
 * Renders a text overlay which hides Jitsi-Meet iFrame when the local
 * participant has been removed from the meeting.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactNode}
 */
export function KickedOverlay(props) {
    return (
        <StatusOverlay title = 'You have been removed from the conference'>
            <div>The conference will be exited automatically in:</div>
            <Countdown onCountdownComplete = { props.onRedirect } />
        </StatusOverlay>
    );
}

KickedOverlay.propTypes = {
    onRedirect: PropTypes.func
};
