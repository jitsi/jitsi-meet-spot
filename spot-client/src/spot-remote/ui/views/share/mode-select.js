import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import { ScreenShare, WirelessScreenshare } from 'common/icons';

/**
 * Displays buttons for starting wireless screenshare or becoming a full
 * featured Spot-Remote.
 *
 * @extends React.Component
 */
export class ModeSelect extends React.Component {
    static defaultProps = {
        wirelessScreenshareDisabledText: ''
    };

    static propTypes = {
        onGoToSpotRemoveView: PropTypes.func,
        onStartWirelessScreenshare: PropTypes.func,
        t: PropTypes.func,
        wirelessScreenshareDisabledText: PropTypes.string
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            onStartWirelessScreenshare,
            onGoToSpotRemoveView,
            wirelessScreenshareDisabledText,
            t
        } = this.props;

        return (
            <div
                className = 'mode-select'
                data-qa-id = 'mode-select'>
                <div className = 'title'>
                    { t('screenshare.selectMode') }
                </div>
                <div className = 'selections'>
                    <button
                        className = 'selection'
                        data-qa-id = 'start-share'
                        disabled = { Boolean(wirelessScreenshareDisabledText) }
                        onClick = { onStartWirelessScreenshare }>
                        <WirelessScreenshare />
                        <span className = 'selection-label'>
                            { t('screenshare.wireless') }
                        </span>
                        <span className = 'selection-sub-label'>
                            { t('screenshare.shareComputer') }
                        </span>
                    </button>
                    <button
                        className = 'selection'
                        data-qa-id = 'remote-control'
                        onClick = { onGoToSpotRemoveView }>
                        <ScreenShare />
                        <span className = 'selection-label'>
                            { t('screenshare.remoteMode') }
                        </span>
                        <span className = 'selection-sub-label'>
                            { t('screenshare.controlRoom') }
                        </span>
                    </button>
                </div>
                <div className = 'footer'>
                    { wirelessScreenshareDisabledText }
                </div>
            </div>
        );
    }
}

export default withTranslation()(ModeSelect);
