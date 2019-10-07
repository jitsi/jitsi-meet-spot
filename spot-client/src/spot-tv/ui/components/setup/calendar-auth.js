import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import { calendarTypes } from 'common/app-state';
import { logger } from 'common/logger';
import { Button } from 'common/ui';

import { calendarService } from './../../../calendars';

/**
 * Prompts to sign in to the calendar service and allow Spot-TV to access
 * calendar events.
 *
 * @extends React.Component
 */
export class CalendarAuth extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        onSuccess: PropTypes.func,
        t: PropTypes.func
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
        const { t } = this.props;

        return (
            <div className = 'spot-setup setup-step'>
                <div className = 'setup-title'>
                    { t('setup.google') }
                </div>
                <div className = 'setup-buttons'>
                    <Button onClick = { this._onAuthEnterGoogle }>
                        { t('buttons.submit') }
                    </Button>
                </div>
                <div className = 'setup-title'>
                    { t('setup.outlook') }
                </div>
                <div className = 'setup-buttons'>
                    <Button onClick = { this._onAuthEnterOutlook }>
                        { t('buttons.submit') }
                    </Button>
                </div>
            </div>
        );
    }

    /**
     * Starts the authentication flow to sign in to a calendar integration and
     * allow Spot-TV to access calendar events.
     *
     * @param {string} type - The constant for the calendar integration to
     * authenticate with.
     * @private
     * @returns {Promise}
     */
    _onAuthEnter(type) {
        logger.log('calendar selected', { type });

        return calendarService.initialize(type)
            .then(() => calendarService.triggerSignIn())
            .then(() => {
                logger.log('calendarAuth successfully authorized');

                this.props.onSuccess();
            })
            .catch(error => logger.error('calendar auth failed', { error }));
    }

    /**
     * Starts the authentication flow to sign in to Google calendar integration
     * and allow Spot-TV to access calendar events.
     *
     * @private
     * @returns {Promise}
     */
    _onAuthEnterGoogle() {
        return this._onAuthEnter(calendarTypes.GOOGLE);
    }

    /**
     * Starts the authentication flow to sign in to Outlook calendar integration
     * and allow Spot-TV to access calendar events.
     *
     * @private
     * @returns {Promise}
     */
    _onAuthEnterOutlook() {
        return this._onAuthEnter(calendarTypes.OUTLOOK);
    }
}

export default withTranslation()(CalendarAuth);
