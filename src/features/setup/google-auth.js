import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

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
        clientId: PropTypes.string,
        dispatch: PropTypes.func,
        onSuccess: PropTypes.func,
        remoteControlServiceConfig: PropTypes.object
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
        google.initialize(this.props.clientId)
            .then(() => google.triggerSignIn())
            .then(() => this.props.onSuccess())
            .catch(error => logger.error(error));
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code GoogleAuth}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        clientId: state.config.CLIENT_ID
    };
}

export default connect(mapStateToProps)(GoogleAuth);
