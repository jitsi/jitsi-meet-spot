import PropTypes from 'prop-types';
import React from 'react';

import { Button } from 'features/button';
import styles from '../remote-control-menu.css';

export default function ScreenshareButton({ isScreensharing, onClick }) {
    return (
        <div
            className = { styles.selection }
            onClick = { onClick }>
            <Button className = { styles.button }>
                <div className = 'icon-share-desktop' />
            </Button>
            <span>{ isScreensharing
                ? 'Stop screensharing'
                : 'Start screensharing' }</span>
        </div>
    );
}

ScreenshareButton.propTypes = {
    isScreensharing: PropTypes.bool,
    onClick: PropTypes.func.isRequired
};
