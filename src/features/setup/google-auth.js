import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { updateGoogleClient } from 'actions';
import { google } from 'calendars';
import { getApiKey, getClientId } from 'reducers';

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
            <div>
                <h1>Auth</h1>
                <input
                    onChange = { this._onApiKeyChange }
                    placeholder = 'API_KEY'
                    value = { this.state.apiKey } />
                <input
                    onChange = { this._onCliendIdChange }
                    placeholder = 'CLIENT_ID'
                    value = { this.state.clientId } />
                <button onClick = { this._onAuthEnter }>
                    Submit
                </button>
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
