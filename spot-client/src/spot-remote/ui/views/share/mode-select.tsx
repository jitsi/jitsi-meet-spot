import { ScreenShare, WirelessScreenshare } from 'common/icons';
import React from 'react';
import { withTranslation } from 'react-i18next';


interface IProps {

    /**
     * Callback to enter the full Spot-Remote control view.
     */
    onGoToSpotRemoveView?: () => void;

    /**
     * Callback to start a wireless screenshare.
     */
    onStartWirelessScreenshare?: () => void;

    /**
     * The translate function.
     */
    t?: (key: string) => string;

    /**
     * The text to display when wireless screensharing is disabled.
     */
    wirelessScreenshareDisabledText?: string;
}

/**
 * Displays buttons for starting wireless screenshare or becoming a full
 * featured Spot-Remote.
 */
export class ModeSelect extends React.Component<IProps> {
    static defaultProps = {
        wirelessScreenshareDisabledText: ''
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
                    { t?.('screenshare.selectMode') }
                </div>
                <div className = 'selections'>
                    <button
                        className = 'selection'
                        data-qa-id = 'start-share'
                        disabled = { Boolean(wirelessScreenshareDisabledText) }
                        onClick = { onStartWirelessScreenshare }>
                        <WirelessScreenshare />
                        <span className = 'selection-label'>
                            { t?.('screenshare.wireless') }
                        </span>
                        <span className = 'selection-sub-label'>
                            { t?.('screenshare.shareComputer') }
                        </span>
                    </button>
                    <button
                        className = 'selection remote-control'
                        data-qa-id = 'remote-control'
                        onClick = { onGoToSpotRemoveView }>
                        <ScreenShare />
                        <span className = 'selection-label'>
                            { t?.('screenshare.remoteMode') }
                        </span>
                        <span className = 'selection-sub-label'>
                            { t?.('screenshare.controlRoom') }
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
