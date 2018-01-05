import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { loadComplete } from 'actions';
import { google } from 'calendars';
import { preloadImage } from 'utils';

import View from './view';
import styles from './view.css';

import { BACKGROUND_IMAGE_URL } from 'app-constants';
import { LoadingIcon } from 'features/loading-icon';
import { getApiKey, getCalendarName, getClientId } from 'reducers';

export class LoadingView extends React.Component {
    static propTypes = {
        _apiKey: PropTypes.string,
        _calendarName: PropTypes.string,
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
            <View hideBackground = { true }>
                <div className = { styles.loading }>
                    <LoadingIcon />

                </div>
            </View>
        );
    }

    loadGoogle() {
        return google.load();
    }

    handle() {
        const { _apiKey, _calendarName, _clientId } = this.props;

        if (_clientId && _apiKey && _calendarName) {
            const imageLoadPromise = preloadImage(BACKGROUND_IMAGE_URL)
                .catch(error => {
                    console.error(error);
                });

            const authPromise = google.authenticate(_clientId, _apiKey)
                .then(() => {
                    if (!google.isAuthenticated()) {
                        return google.triggerSignIn();
                    }
                })
                .catch(() => {
                    this.redirectToSetup();

                    return Promise.reject();
                });

            return Promise.all([ imageLoadPromise, authPromise ])
                .then(() => {
                    this.props.dispatch(loadComplete());
                    this.props.history.push('/');
                })
                .catch(() => {
                    this.props.dispatch(loadComplete());
                    console.warn('error loading app');
                });
        }

        setTimeout(() => {
            this.redirectToSetup();
        }, 2000);
    }

    redirectToSetup() {
        this.props.dispatch(loadComplete());
        this.props.history.push('/setup');
    }
}

function mapStateToProps(state) {
    return {
        _apiKey: getApiKey(state),
        _clientId: getClientId(state),
        _calendarName: getCalendarName(state)
    };
}

export default connect(mapStateToProps)(LoadingView);
