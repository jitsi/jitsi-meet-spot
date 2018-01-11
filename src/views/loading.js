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
import { getClientId } from 'reducers';

export class LoadingView extends React.Component {
    static propTypes = {
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
                    <LoadingIcon color = 'white' />
                </div>
            </View>
        );
    }

    loadGoogle() {
        return google.load();
    }

    handle() {
        const { _clientId } = this.props;

        if (_clientId) {
            const imageLoadPromise = preloadImage(BACKGROUND_IMAGE_URL)
                .catch(error => {
                    console.error(error);
                });

            const authPromise = google.authenticate(_clientId)
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
        _clientId: getClientId(state)
    };
}

export default connect(mapStateToProps)(LoadingView);
