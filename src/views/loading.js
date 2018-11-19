import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setLoadCompleted, setLocalRemoteControlID } from 'actions';
import { google } from 'calendars';
import { LoadingIcon } from 'features/loading-icon';
import { remoteControlService } from 'remote-control';
import { backgroundService, logger } from 'utils';

import View from './view';
import styles from './view.css';

/**
 * The initial view of the application which displays a loading indicator while
 * bootstrapping the application.
 *
 * @extends React.Component
 */
export class Loading extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        history: PropTypes.object,
        location: PropTypes.object
    };

    /**
     * Bootstraps the application with resources and data necessary to use the
     * application.
     *
     * @inheritdoc
     */
    componentDidMount() {
        const backgroundUrl = backgroundService.getBackgroundUrl();
        const backgroundLoad = backgroundUrl
            ? backgroundService.loadBackground(backgroundUrl)
            : Promise.resolve();

        backgroundLoad
            .catch(error => logger.error(error))
            .then(() => remoteControlService.init())
            .then(jid => this.props.dispatch(setLocalRemoteControlID(jid)))
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

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
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

export default connect()(Loading);
