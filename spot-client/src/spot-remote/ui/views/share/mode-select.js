import PropTypes from 'prop-types';
import React from 'react';

import { NavButton } from './../../components';

/**
 * Displays buttons for starting wireless screenshare or becoming a Spot-Remote.
 *
 * @extends React.Component
 */
export class ModeSelect extends React.Component {
    static propTypes = {
        isScreenshareActive: PropTypes.bool,
        isWirelessScreenshareSupported: PropTypes.bool,
        onGoToSpotRemoveView: PropTypes.func,
        onStartWirelessScreenshare: PropTypes.func
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            isWirelessScreenshareSupported,
            isScreenshareActive,
            onStartWirelessScreenshare,
            onGoToSpotRemoveView
        } = this.props;

        let disabled = false;
        let footerMessage = '';

        if (!isWirelessScreenshareSupported) {
            disabled = true;
            footerMessage = 'Your browser is currently not supported. '
                + 'To share content please use Chrome.';
        } else if (isScreenshareActive) {
            disabled = true;
            footerMessage = 'Cannot start wireless screenshare while screenshare is active.';
        }

        return (
            <div
                className = 'mode-select'
                data-qa-id = 'mode-select'>
                <div className = 'title'>
                    Select a Mode
                </div>
                <div className = 'selections'>
                    <div className = 'selection'>
                        <NavButton
                            disabled = { disabled }
                            iconName = 'screen_share'
                            label = 'Wireless screensharing'
                            onClick = { onStartWirelessScreenshare }
                            qaId = 'start-share' />
                    </div>
                    <div className = 'selection'>
                        <NavButton
                            iconName = 'arrow_forward'
                            label = 'Remote Control'
                            onClick = { onGoToSpotRemoveView }
                            qaId = 'remote-control' />
                    </div>
                </div>
                <div className = 'footer'>
                    { footerMessage }
                </div>
            </div>
        );
    }
}

export default ModeSelect;
