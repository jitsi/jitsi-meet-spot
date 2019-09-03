import React from 'react';

import { StatusOverlay } from 'common/ui';

/**
 * Informs that the Spot-TV may not be online.
 *
 * @returns {ReactElement}
 */
export default function WaitingForSpotTVOverlay() {
    return (
        <StatusOverlay title = 'Waiting for Spot-TV to connect'>
            <div data-qa-id = 'waiting-for-spot-tv'>
                Please make sure the associated Spot-TV is currently running<br />
                and connected to the Internet.
            </div>
        </StatusOverlay>
    );
}
