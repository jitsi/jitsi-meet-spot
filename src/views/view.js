import PropTypes from 'prop-types';
import React from 'react';

import { remoteControlService } from 'remote-control';
import { backgroundService } from 'utils';

import styles from './view.css';

/**
 * A React Component representing a single screen in the single-page application
 * and is responsible for basic layout.
 *
 * @extends React.Component
 */
export default class View extends React.Component {
    static propTypes = {
        hideBackground: PropTypes.bool,
        children: PropTypes.node,
        name: PropTypes.string
    };

    /**
     * Updates the {@code remoteControlService} with the currently displayed
     * viewed name.
     *
     * @inheritdoc
     */
    componentDidMount() {
        if (this.props.name) {
            remoteControlService.sendPresence('view', this.props.name);
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        let backgroundStyles;

        if (!this.props.hideBackground) {
            const backgroundUrl = backgroundService.getBackgroundUrl();

            if (backgroundUrl) {
                backgroundStyles = {
                    backgroundImage: `url('${backgroundUrl}')`
                };
            }
        }

        return (
            <div
                className = { styles.view }
                style = { backgroundStyles }>
                { this.props.children }
            </div>
        );
    }
}
