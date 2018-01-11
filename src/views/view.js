import PropTypes from 'prop-types';
import React from 'react';

import { backgroundService } from 'utils';

import styles from './view.css';

export default class View extends React.Component {
    static propTypes = {
        hideBackground: PropTypes.bool,
        children: PropTypes.node
    };

    render() {
        let backgroundStyles;

        if (!this.props.hideBackground) {
            const backgroundUrl = backgroundService.getBackgroundUrl();

            backgroundStyles = { backgroundImage: `url('${backgroundUrl}')` };
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
