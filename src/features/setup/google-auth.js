import PropTypes from 'prop-types';
import React from 'react';

import { google } from 'calendars';

import { Button } from 'features/button';
import styles from './setup.css';

export class GoogleAuth extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        onSuccess: PropTypes.func
    };

    constructor(props) {
        super(props);

        this._onAuthEnter = this._onAuthEnter.bind(this);
    }

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

    _onAuthEnter() {
        return google.authenticate()
            .then(() => {
                if (!google.isAuthenticated()) {
                    return google.triggerSignIn();
                }
            })
            .then(() => {
                this.props.onSuccess();
            })
            .catch(error => {
                console.warn('error', error);
            });
    }
}

export default GoogleAuth;
