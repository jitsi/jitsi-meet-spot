import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import { Button, ResetState } from 'common/ui';
import { ROUTES } from 'common/routing';

import {
    CalendarStatus,
    InMeetingConfig,
    ScreenshareStatus
} from './../components';

import SpotView from './spot-view';

/**
 * A component for providing post-setup Spot configuration.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function AdminView(props) {
    return (
        <SpotView
            name = 'admin'
            remoteControlService = { props.remoteControlService }>
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

AdminView.propTypes = {
    remoteControlService: PropTypes.object
};
