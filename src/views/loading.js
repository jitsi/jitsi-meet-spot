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

export class LoadingView extends React.Component {
    static propTypes = {
        _calendarName: PropTypes.string,
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
        const imageLoadPromise = preloadImage(BACKGROUND_IMAGE_URL)
            .catch(error => {
                console.error(error);
            });

        const authPromise = google.authenticate()
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

    redirectToSetup() {
        this.props.dispatch(loadComplete());
        this.props.history.push('/setup');
    }
}

export default connect()(LoadingView);
