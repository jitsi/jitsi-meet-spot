import PropTypes from 'prop-types';
import React from 'react';

import { Button } from 'features/button';
import { LoadingIcon } from 'features/loading-icon';

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
    let icon;

    if (isWirelessScreenshareConnectionActive && !isScreensharing) {
        buttonContent = <LoadingIcon color = 'black' />;
        icon = 'screen_share';
    } else if (isScreensharing) {
        buttonContent = 'Stop screensharing';
        icon = 'stop_screen_share';
    } else {
        buttonContent = 'Start wireless screensharing';
        icon = 'screen_share';
    }

    return (
        <div
            className = 'remote-selection'
            onClick = { onClick } >
            <Button className = 'remote-button'>
                <i className = 'material-icons'>{ icon }</i>
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
