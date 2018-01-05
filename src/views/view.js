import PropTypes from 'prop-types';
import React from 'react';

import { BACKGROUND_IMAGE_URL } from 'app-constants';

import styles from './view.css';

export default class View extends React.Component {
    static propTypes = {
        hideBackground: PropTypes.bool,
        children: PropTypes.node
    };

    render() {
        const backgroundStyles = this.props.hideBackground
            ? {}
            : { backgroundImage: `url('${BACKGROUND_IMAGE_URL}')` };

        return (
            <div
                className = { styles.view }
                style = { backgroundStyles }>
                { this.props.children }
            </div>
        );
    }
}
