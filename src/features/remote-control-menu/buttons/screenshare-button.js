import PropTypes from 'prop-types';
import React from 'react';

import { Button } from 'features/button';
import styles from '../remote-control-menu.css';

export default class ScreenshareButton extends React.Component {
    static propTypes = {
        onClick: PropTypes.func
    };

    render() {
        return (
            <div
                className = { styles.selection }
                onClick = { this.props.onClick }>
                <Button className = { styles.button }>
                    <div className = 'icon-share-desktop' />
                </Button>
                <span>Screenshare</span>
            </div>
        );
    }
}
