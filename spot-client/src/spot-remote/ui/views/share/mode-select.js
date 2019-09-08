import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

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
        onStartWirelessScreenshare: PropTypes.func,
        t: PropTypes.func
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
            onGoToSpotRemoveView,
            t
        } = this.props;

        let disabled = false;
        let footerMessage = '';

        if (!isWirelessScreenshareSupported) {
            disabled = true;
            footerMessage = t('screenshare.notSupported');
        } else if (isScreenshareActive) {
            disabled = true;
            footerMessage = t('screenshare.alreadyActive');
        }

        return (
            <div
                className = 'mode-select'
                data-qa-id = 'mode-select'>
                <div className = 'title'>
                    { t('screenshare.selectMode') }
                </div>
                <div className = 'selections'>
                    <div className = 'selection'>
                        <NavButton
                            disabled = { disabled }
                            label = { t('screenshare.screenshareMode') }
                            onClick = { onStartWirelessScreenshare }
                            qaId = 'start-share'>
                            <ScreenShare />
                        </NavButton>
                    </div>
                    <div className = 'selection'>
                        <NavButton
                            label = { t('screenshare.remoteMode') }
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

export default withTranslation()(ModeSelect);
