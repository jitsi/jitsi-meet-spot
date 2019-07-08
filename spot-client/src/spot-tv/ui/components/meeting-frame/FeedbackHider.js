import React from 'react';

import { StatusOverlay } from 'common/ui';

/**
 * Renders a text overlay which hides Jitsi-Meet iFrame when it's asking for
 * feedback.
 *
 * @returns {ReactNode}
 */
export function FeedbackHider() {
    return (
        <StatusOverlay title = 'Thanks for using Spot!'>
            <div>You can use the remote control device to submit feedback now.</div>
        </StatusOverlay>
    );
}
