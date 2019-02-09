import React from 'react';
import { Link } from 'react-router-dom';

import {
    CalendarStatus,
    InMeetingConfig,
    ResetState,
    ScreenshareStatus
} from 'features/admin';
import { Button } from 'features/button';
import { ROUTES } from 'routing';

import SpotView from './spot-view';

/**
 * A component for providing post-setup Spot configuration.
 *
 * @returns {ReactElement}
 */
export default function AdminView() {
    return (
        <SpotView name = 'admin'>
            <div className = 'container'>
                <div className = 'admin'>
                    <CalendarStatus />
                    <ScreenshareStatus />
                    <ResetState />
                    <InMeetingConfig />
                    <div>
                        <Link to = { ROUTES.SETUP }>
                            <Button>Setup</Button>
                        </Link>
                    </div>
                    <div>
                        <Link to = { ROUTES.HOME }>
                            <Button>Done</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </SpotView>
    );
}
