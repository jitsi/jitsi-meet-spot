import PropTypes from 'prop-types';
import React from 'react';

import { remoteControlService } from 'remote-control';

import styles from './view.css';

/**
 * A React Component representing a single screen in the application and is
 * responsible for basic layout.
 *
 * @extends React.Component
 */
export default class View extends React.Component {
    static propTypes = {
        backgroundImageUrl: PropTypes.string,
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

        if (this.props.backgroundImageUrl) {
            backgroundStyles = {
                backgroundImage: `url('${this.props.backgroundImageUrl}')`
            };
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
