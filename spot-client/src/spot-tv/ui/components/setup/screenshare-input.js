import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { wiredScreenshareService } from './../../../wired-screenshare-service';
import {
    setScreenshareDevice,
    setScreenshareIdleValue
} from 'common/actions';
import { logger } from 'common/logger';
import { Button } from 'common/ui';

/**
 * Displays a picker for selecting a video input device to use while
 * performing a wired screenshare.
 *
 * @extends React.Component
 */
class ScreenshareInput extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        onSuccess: PropTypes.func
    };

    /**
     * Initializes a new {@code ScreenshareInput} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            devices: []
        };

        this._onSkip = this._onSkip.bind(this);
        this._selectDevice = this._selectDevice.bind(this);
    }

    /**
     * Fetches and stores available devices.
     *
     * @inheritdoc
     */
    componentDidMount() {
        wiredScreenshareService.getVideoInputDevices()
            .then(cameras => {
                logger.log(`screenshareInput got ${cameras.length} devices`);

                this.setState({
                    devices: cameras
                });
            })
            .catch(error =>
                logger.error(`screenshareInput failed gUM ${
                    JSON.stringify(error)}`));
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <div className = 'setup-step'>
                <div className = 'setup-title'>
                    Select screenshare input
                </div>
                <div>Please ensure no device is connected to the input</div>
                <div className = 'setup-content'>
                    { this._renderDeviceList() }
                </div>
                <div className = 'setup-buttons'>
                    <Button onClick = { this._onSkip }>
                        Skip
                    </Button>
                </div>
            </div>
        );
    }

    /**
     * Callback invoked to select no device for wired screensharing.
     *
     * @private
     * @returns {void}
     */
    _onSkip() {
        logger.log('screenshareInput skipping device selection');

        this.props.dispatch(setScreenshareDevice());
        this.props.dispatch(setScreenshareIdleValue());

        this.props.onSuccess();
    }

    /**
     * Creates a list of select-able video input devices for wired
     * screensharing.
     *
     * @private
     * @returns {Array<ReactElement>}
     */
    _renderDeviceList() {
        return this.state.devices.map(device => (
            <Button
                key = { device.deviceId }

                // eslint-disable-next-line react/jsx-no-bind
                onClick = { () => this._selectDevice(device.label) }>
                { device.label }
            </Button>
        ));
    }

    /**
     * Callback invoked to set a selected device as the device to use when
     * performing a wired-screenshare.
     *
     * @param {string} label - The device label of the selected device.
     * @private
     * @returns {void}
     */
    _selectDevice(label) {
        logger.log('screenshareInput selected a device');

        const changeListener
            = wiredScreenshareService.getVideoChangeListener(label);

        changeListener.start()
            .then(() => {
                const value = changeListener.getCurrentValue();

                changeListener.destroy();

                this.props.dispatch(setScreenshareDevice(label));
                this.props.dispatch(setScreenshareIdleValue(value));

                this.props.onSuccess();
            });
    }
}

export default connect()(ScreenshareInput);
