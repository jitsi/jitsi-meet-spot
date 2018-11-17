import PropTypes from 'prop-types';
import React from 'react';

import { google } from 'calendars';
import { Button } from 'features/button';
import { logger } from 'utils';

import styles from './setup.css';

/**
 * Prompts to sign in to Google and allow the application to access calendar
 * events.
 */
export class GoogleAuth extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        onSuccess: PropTypes.func
    };

    /**
     * Initializes a new {@code GoogleAuth} instance.
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
     * Starts the Google authentication flow to sign in to Google and allow
     * the application to access calendar events.
     *
     * @private
     * @returns {Promise}
     */
    _onAuthEnter() {
        return google.triggerSignIn()
            .then(() => this.props.onSuccess())
            .catch(error => logger.error(error));
    }
}

export default GoogleAuth;
