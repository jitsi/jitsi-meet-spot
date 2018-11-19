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

/**
 * The initial view of the application which displays a loading indicator while
 * bootstrapping the application.
 *
 * @extends React.Component
 */
export class Loading extends React.Component {
    static propTypes = {
        backgroundImageUrl: PropTypes.string,
        clientId: PropTypes.string,
        dispatch: PropTypes.func,
        history: PropTypes.object,
        location: PropTypes.object,
        remoteControlServiceConfig: PropTypes.object
    };

    /**
     * Bootstraps the application with resources and data necessary to use the
     * application.
     *
     * @inheritdoc
     */
    componentDidMount() {
        const backgroundLoad = this.props.backgroundImageUrl
            ? backgroundService.loadBackground(this.props.backgroundImageUrl)
            : Promise.resolve();

        backgroundLoad
            .catch(error => logger.error(error))
            .then(() => remoteControlService.init(
                this.props.dispatch, this.props.remoteControlServiceConfig))
            .then(() =>
                remoteControlService.createMuc(remoteControlService.getNode()))
            .then(() => remoteControlService.joinMuc())
            .catch(error => logger.error(error))
            .then(() => google.initialize(this.props.clientId))
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
            <View>
                <div className = { styles.loading }>
                    <LoadingIcon color = 'white' />
                </div>
            </View>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code Loading}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        backgroundImageUrl: state.config.DEFAULT_BACKGROUND_IMAGE_URL,
        clientId: state.config.CLIENT_ID,
        remoteControlServiceConfig: state.config.XMPP_CONFIG
    };
}

export default connect(mapStateToProps)(Loading);
