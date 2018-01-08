import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { updateGoogleClient } from 'actions';
import { google } from 'calendars';
import { getApiKey, getClientId } from 'reducers';

import { Button } from 'features/button';
import { Input } from 'features/input';
import styles from './setup.css';

export class GoogleAuth extends React.Component {
    static propTypes = {
        _apiKey: PropTypes.string,
        _clientId: PropTypes.string,
        dispatch: PropTypes.func,
        onSuccess: PropTypes.func
    };

    constructor(props) {
        super(props);

        this._onAuthEnter = this._onAuthEnter.bind(this);
        this._onApiKeyChange = this._onApiKeyChange.bind(this);
        this._onCliendIdChange = this._onCliendIdChange.bind(this);

        this.state = {
            apiKey: props._apiKey || '',
            clientId: props._clientId || ''
        };
    }

    render() {
        return (
            <div className = { styles.step }>
                <div className = { styles.title }>
                    Authenticate With Google
                </div>
                <div className = { styles.content }>
                    <div>
                        <div>Api Key</div>
                        <Input
                            onChange = { this._onApiKeyChange }
                            placeholder = 'Enter api key'
                            value = { this.state.apiKey } />
                    </div>
                    <div>
                        <div>Client ID</div>
                        <Input
                            onChange = { this._onCliendIdChange }
                            placeholder = 'Enter client id'
                            value = { this.state.clientId } />
                    </div>
                </div>
                <div className = { styles.buttons }>
                    <Button onClick = { this._onAuthEnter }>
                        Submit
                    </Button>
                </div>
            </div>
        );
    }

    _onApiKeyChange(event) {
        this.setState({
            apiKey: event.target.value
        });
    }

    _onAuthEnter() {
        const { apiKey, clientId } = this.state;

        return google.authenticate(clientId, apiKey)
            .then(() => {
                if (!google.isAuthenticated()) {
                    return google.triggerSignIn();
                }
            })
            .then(() => {
                this.props.dispatch(updateGoogleClient(clientId, apiKey));
                this.props.onSuccess();
            })
            .catch(error => {
                console.warn('error', error);
            });
    }

    _onCliendIdChange(event) {
        this.setState({
            clientId: event.target.value
        });
    }
}

function mapStateToProps(state) {
    return {
        _apiKey: getApiKey(state),
        _clientId: getClientId(state)
    };
}


export default connect(mapStateToProps)(GoogleAuth);
