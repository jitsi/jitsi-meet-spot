import React from 'react';
import { Link } from 'react-router-dom';

import { Button, ResetState } from 'common/ui';
import { ROUTES } from 'common/routing';

import {
    CalendarStatus,
    InMeetingConfig,
    SelectMedia
} from './../components';

/**
 * A component for providing post-setup Spot-TV configuration.
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

        this._onChangeDevices = this._onChangeDevices.bind(this);
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
            <div className = 'admin'>
                { this._renderSubcomponent() }
            </div>
        );
    }

    /**
     * Returns the contents of the view that should be displayed.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderSubcomponent() {
        switch (this.state.view) {
        case 'device-selection':
            return (
                <SelectMedia onSuccess = { this._onShowAllOptions } />
            );
        case 'all':
        default:
            return (
                <>
                    <CalendarStatus />
                    <div>
                        <div className = 'admin-title'>
                            Preferred devices
                        </div>
                        <Button
                            onClick = { this._onChangeDevices }
                            qaId = 'device-selection-button'>
                            Device Selection
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
                            <Button qaId = 'admin-exit'>
                                Exit
                            </Button>
                        </Link>
                    </div>
                </>
            );
        }
    }

    /**
     * Displays the view for setting preferred audio and video devices for
     * conferencing.
     *
     * @private
     * @returns {void}
     */
    _onChangeDevices() {
        this.setState({ view: 'device-selection' });
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
