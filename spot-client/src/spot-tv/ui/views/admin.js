import React from 'react';
import { Link } from 'react-router-dom';

import { Button, ResetState } from 'common/ui';
import { ROUTES } from 'common/routing';

import {
    CalendarStatus,
    InMeetingConfig,
    Profile,
    ScreenshareInput,
    ScreenshareStatus
} from './../components';

/**
 * A component for providing post-setup Spot configuration.
 *
 * @extends React.Component
 */
export default class AdminView extends React.Component {
    /**
     * Initializes a new {@code AdminView} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            view: 'all'
        };

        this._onChangeProfile = this._onChangeProfile.bind(this);
        this._onChangeScreenshareInput
            = this._onChangeScreenshareInput.bind(this);
        this._onShowAllOptions = this._onShowAllOptions.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div className = 'container'>
                <div className = 'admin'>
                    { this._renderSubcomponent() }
                </div>
            </div>
        );
    }

    /**
     * Returns the contents that should be displayed.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderSubcomponent() {
        switch (this.state.view) {
        case 'profile':
            return <Profile onSuccess = { this._onShowAllOptions } />;
        case 'screenshare-input':
            return <ScreenshareInput onSuccess = { this._onShowAllOptions } />;
        case 'all':
        default:
            return (
                <>
                    <CalendarStatus />
                    <div>
                        <div className = 'admin-title'>Profile</div>
                        <Button onClick = { this._onChangeProfile }>
                            Change
                        </Button>
                    </div>
                    <div>
                        <div className = 'admin-title'>Screenshare Input</div>
                        <ScreenshareStatus />
                        <Button
                            data-qa-id = 'admin-change-screenshare'
                            onClick = { this._onChangeScreenshareInput }>
                            Change
                        </Button>
                    </div>
                    <ResetState />
                    <InMeetingConfig />
                    <div>
                        <div className = 'admin-title'>Setup Wizard</div>
                        <Link to = { ROUTES.SETUP }>
                            <Button>Start wizard</Button>
                        </Link>
                    </div>
                    <div>
                        <div className = 'admin-title'>Exit Admin Tools</div>
                        <Link to = { ROUTES.HOME }>
                            <Button data-qa-id = 'admin-exit'>
                                Exit
                            </Button>
                        </Link>
                    </div>
                </>
            );
        }
    }

    /**
     * Displays the view for setting a display name and avatar to use during a
     * meeting.
     *
     * @private
     * @returns {void}
     */
    _onChangeProfile() {
        this.setState({ view: 'profile' });
    }

    /**
     * Displays the view for selecting a wired screensharing input device.
     *
     * @private
     * @returns {void}
     */
    _onChangeScreenshareInput() {
        this.setState({ view: 'screenshare-input' });
    }

    /**
     * Displays the main admin view for a summary of the current Spot-TV
     * configuration.
     *
     * @private
     * @returns {void}
     */
    _onShowAllOptions() {
        this.setState({ view: 'all' });
    }
}
