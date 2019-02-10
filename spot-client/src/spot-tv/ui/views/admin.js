import React from 'react';
import { Link } from 'react-router-dom';

import { Button } from 'common/ui';
import { ROUTES } from 'common/routing';

import {
    CalendarStatus,
    InMeetingConfig,
    ResetState,
    ScreenshareStatus
} from './../components';

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
