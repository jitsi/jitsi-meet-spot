import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { loadComplete } from 'actions';
import { google } from 'calendars';

import View from './view';

import { getApiKey, getClientId } from 'reducers';

export class LoadingView extends React.Component {
    static propTypes = {
        _apiKey: PropTypes.string,
        _clientId: PropTypes.string,
        dispatch: PropTypes.func,
        history: PropTypes.object
    };

    componentDidMount() {
        this.loadGoogle()
            .then(() => this.handle());
    }

    render() {
        return (
            <View>
                <div>Loading</div>
            </View>
        );
    }

    loadGoogle() {
        return google.load();
    }

    handle() {
        const { _apiKey, _clientId } = this.props;

        if (_clientId && _apiKey) {
            return google.authenticate(_clientId, _apiKey)
                .then(() => {
                    if (!google.isAuthenticated()) {
                        return google.triggerSignIn();
                    }
                })
                .then(() => {
                    this.props.dispatch(loadComplete())
                    this.props.history.push('/');
                })
                .catch(() => {
                    this.redirectToSetup();
                })
        }

        setTimeout(() => {
            this.redirectToSetup();
        }, 2000);
    }

    redirectToSetup() {
        this.props.dispatch(loadComplete())
        this.props.history.push('/setup');
    }
}

function mapStateToProps(state) {
    return {
        _apiKey: getApiKey(state),
        _clientId: getClientId(state)
    };
}

export default connect(mapStateToProps)(LoadingView);
