import PropTypes from 'prop-types';
import React from 'react';

import { Button } from 'features/button';
import { LoadingIcon } from 'features/loading-icon';
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
    const {
        isScreensharing,
        isWirelessScreenshareConnectionActive,
        onClick
    } = props;
    let buttonContent;

    if (isWirelessScreenshareConnectionActive && !isScreensharing) {
        buttonContent = <LoadingIcon color = 'black' />;
    } else if (isScreensharing) {
        buttonContent = 'Stop screensharing';
    } else {
        buttonContent = 'Start wireless screensharing';
    }

    return (
        <div
            className = { styles.selection }
            onClick = { onClick } >
            <Button className = { styles.button }>
                <div className = 'icon-share-desktop' />
            </Button>
            <span>{ buttonContent }</span>
        </div>
    );
}

WirelessScreenshareButton.propTypes = {
    isScreensharing: PropTypes.bool,
    isWirelessScreenshareConnectionActive: PropTypes.bool,
    onClick: PropTypes.func.isRequired
};
