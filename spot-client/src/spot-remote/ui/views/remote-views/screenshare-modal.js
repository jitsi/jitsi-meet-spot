import PropTypes from 'prop-types';
import React from 'react';

import { ScreensharePicker } from './../../components';

/**
 * Wraps {@code ScreensharePicker} so it can be displayed in a modal.
 *
 * @extends React.Component
 */
export class ScreenshareModal extends React.Component {
    static propTypes = {
        onClose: PropTypes.func,
        onStartWiredScreenshare: PropTypes.func,
        onStartWirelessScreenshare: PropTypes.func,
        onStopScreensharing: PropTypes.func,
        screensharingType: PropTypes.string,
        wiredScreenshareEnabled: PropTypes.bool,
        wirelessScreenshareEnabled: PropTypes.bool
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div className = 'modal'>
                <div className = 'modal-shroud' />
                <div className = 'modal-content'>
                    <button
                        className = 'close'
                        onClick = { this.props.onClose }
                        type = 'button'>
                        x
                    </button>
                    <div className = 'share-select-view'>
                        <ScreensharePicker
                            onStartWiredScreenshare
                                = { this.props.onStartWiredScreenshare }
                            onStartWirelessScreenshare
                                = { this.props.onStartWirelessScreenshare }
                            onStopScreensharing
                                = { this.props.onStopScreensharing }
                            screensharingType = { this.props.screensharingType }
                            wiredScreenshareEnabled
                                = { this.props.wiredScreenshareEnabled }
                            wirelessScreenshareEnabled
                                = { this.props.wirelessScreenshareEnabled } />
                    </div>
                </div>
            </div>
        );
    }
}

export default ScreenshareModal;
