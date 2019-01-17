import PropTypes from 'prop-types';
import React from 'react';

import { Button } from 'features/button';

import styles from '../remote-control-menu.css';

/**
 * A component for a button that displays a toggle for starting a wireless
 * screensharing session with a Spot or to stop screensharing.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function WirelessScreenshareButton(props) {
    const { isProxyConnectionActive, isScreensharing, onClick } = props;
    let buttonText;

    if (isProxyConnectionActive && !isScreensharing) {
        buttonText = 'Cancel screensharing';
    } else if (isScreensharing) {
        buttonText = 'Stop screensharing';
    } else {
        buttonText = 'Start wireless screensharing';
    }

    return (
        <div
            className = { styles.selection }
            onClick = { onClick } >
            <Button className = { styles.button }>
                <div className = 'icon-share-desktop' />
            </Button>
            <span>{ buttonText }</span>
        </div>
    );
}

WirelessScreenshareButton.propTypes = {
    isProxyConnectionActive: PropTypes.bool,
    isScreensharing: PropTypes.bool,
    onClick: PropTypes.func.isRequired
};
