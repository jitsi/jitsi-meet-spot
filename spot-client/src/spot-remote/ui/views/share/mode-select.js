import PropTypes from 'prop-types';
import React from 'react';

import { ArrowForward, ScreenShare } from 'common/icons';
import { NavButton } from './../../components';

/**
 * Displays buttons for starting wireless screenshare or becoming a full
 * featured Spot-Remote.
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
            footerMessage = 'This browser is currently not supported. '
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
                            label = 'Wireless screensharing'
                            onClick = { onStartWirelessScreenshare }
                            qaId = 'start-share'>
                            <ScreenShare />
                        </NavButton>
                    </div>
                    <div className = 'selection'>
                        <NavButton
                            label = 'Remote Control'
                            onClick = { onGoToSpotRemoveView }
                            qaId = 'remote-control'>
                            <ArrowForward />
                        </NavButton>
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
