import PropTypes from 'prop-types';
import React from 'react';

import { calendarService } from 'calendars';
import { Button } from 'features/button';
import { logger } from 'utils';

import styles from './setup.css';

/**
 * Prompts to sign in to the calendar service and allow the application to
 * access calendar events.
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

        this._onAuthEnter = this._onAuthEnter.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <div className = { styles.step }>
                <div className = { styles.title }>
                    Authenticate With Google
                </div>
                <div className = { styles.buttons }>
                    <Button onClick = { this._onAuthEnter }>
                        Submit
                    </Button>
                </div>
            </div>
        );
    }

    /**
     * Starts the authentication flow to sign in to calendar integration and
     * allow the application to access calendar events.
     *
     * @private
     * @returns {Promise}
     */
    _onAuthEnter() {
        return calendarService.triggerSignIn()
            .then(() => this.props.onSuccess())
            .catch(error => logger.error(error));
    }
}

export default CalendarAuth;
