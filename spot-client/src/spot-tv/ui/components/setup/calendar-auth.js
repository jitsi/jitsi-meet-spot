import PropTypes from 'prop-types';
import React from 'react';

import { Button } from 'common/ui';
import { logger } from 'common/utils';

import { calendarService, integrationTypes } from './../../../calendars';

/**
 * Prompts to sign in to the calendar service and allow Spot to access calendar
 * events.
 *
 * @extends React.Component
 */
export class CalendarAuth extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        onSuccess: PropTypes.func
    };

    /**
     * Initializes a new {@code CalendarAuth} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onAuthEnterGoogle = this._onAuthEnterGoogle.bind(this);
        this._onAuthEnterOutlook = this._onAuthEnterOutlook.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <div className = 'setup-step'>
                <div className = 'setup-title'>
                    Authenticate With Google
                </div>
                <div className = 'setup-buttons'>
                    <Button onClick = { this._onAuthEnterGoogle }>
                        Submit
                    </Button>
                </div>
                <div className = 'setup-title'>
                    Authenticate With Outlook
                </div>
                <div className = 'setup-buttons'>
                    <Button onClick = { this._onAuthEnterOutlook }>
                        Submit
                    </Button>
                </div>
            </div>
        );
    }

    /**
     * Starts the authentication flow to sign in to a calendar integration and
     * allow Spot to access calendar events.
     *
     * @param {string} type - The constant for the calendar integration to
     * authenticate with.
     * @private
     * @returns {Promise}
     */
    _onAuthEnter(type) {
        return calendarService.initialize(type)
            .then(() => calendarService.triggerSignIn())
            .then(() => this.props.onSuccess())
            .catch(error => logger.error(error));
    }

    /**
     * Starts the authentication flow to sign in to Google calendar integration
     * and allow Spot to access calendar events.
     *
     * @private
     * @returns {Promise}
     */
    _onAuthEnterGoogle() {
        return this._onAuthEnter(integrationTypes.GOOGLE);
    }

    /**
     * Starts the authentication flow to sign in to Outlook calendar integration
     * and allow Spot to access calendar events.
     *
     * @private
     * @returns {Promise}
     */
    _onAuthEnterOutlook() {
        return this._onAuthEnter(integrationTypes.OUTLOOK);
    }
}

export default CalendarAuth;
