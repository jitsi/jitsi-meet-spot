import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setLoadCompleted } from 'actions';
import { google } from 'calendars';
import { LoadingIcon } from 'features/loading-icon';
import { remoteControlService } from 'remote-control';
import { backgroundService, logger } from 'utils';

import View from './view';
import styles from './view.css';


export class LoadingView extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        history: PropTypes.object,
        location: PropTypes.object
    };

    componentDidMount() {
        backgroundService.loadBackground()
            .catch(error => logger.error(error))
            .then(() => remoteControlService.init(this.props.dispatch))
            .then(() =>
                remoteControlService.createMuc(remoteControlService.getNode()))
            .then(() => remoteControlService.joinMuc())
            .catch(error => logger.error(error))
            .then(() => google.initialize())
            .then(() => {
                if (!google.isAuthenticated()) {
                    return google.triggerSignIn();
                }
            })
            .then(() => {
                this.props.history.push(
                    this.props.location.state.referrer || '');
            })
            .catch(() => {
                this.props.history.push('/setup');
            })
            .then(() => {
                this.props.dispatch(setLoadCompleted());
            });
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
}

export default connect()(LoadingView);
