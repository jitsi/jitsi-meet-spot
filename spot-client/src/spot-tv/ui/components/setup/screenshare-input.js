import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    setWiredScreenshareInputIdleValue,
    setWiredScreenshareInputLabel
} from 'common/app-state';
import { logger } from 'common/logger';
import { avUtils } from 'common/media';
import { Button } from 'common/ui';

import { wiredScreenshareService } from './../../../wired-screenshare-service';

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

        this._onDeviceListChange = this._onDeviceListChange.bind(this);
        this._onSkip = this._onSkip.bind(this);
        this._selectDevice = this._selectDevice.bind(this);
    }

    /**
     * Fetches and stores available devices.
     *
     * @inheritdoc
     */
    componentDidMount() {
        avUtils.enumerateVideoDevices()
            .then(cameras => {
                logger.log(
                    'got device list for screenshare inputs',
                    { count: cameras.length }
                );

                this._onDeviceListChange(cameras);

                avUtils.listenForCameraDeviceListChange(
                    this._onDeviceListChange);
            })
            .catch(error => logger.error(
                'failed to get list of screenshare inputs', { error }));
    }

    /**
     * Removes listeners for camera list updates.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        avUtils.stopListeningForCameraDeviceListChange(
            this._onDeviceListChange);
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
                <div
                    className = 'setup-content'
                    data-qa-id = 'screenshare-input-devices'>
                    { this._renderDeviceList() }
                </div>
                <div className = 'setup-buttons'>
                    <Button
                        appearance = 'subtle'
                        onClick = { this._onSkip }
                        qaId = 'screenshare-input-skip'>
                        Skip
                    </Button>
                </div>
            </div>
        );
    }

    /**
     * Updates the known values of cameras available for wired screensharing.
     *
     * @param {Array<Object>} cameras - Device information for the cameras.
     * @private
     * @returns {void}
     */
    _onDeviceListChange(cameras) {
        this.setState({ devices: cameras });
    }

    /**
     * Callback invoked to select no device for wired screensharing.
     *
     * @private
     * @returns {void}
     */
    _onSkip() {
        logger.log('screenshareInput skipping device selection');

        this.props.dispatch(setWiredScreenshareInputLabel());
        this.props.dispatch(setWiredScreenshareInputIdleValue());

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

                this.props.dispatch(setWiredScreenshareInputLabel(label));
                this.props.dispatch(setWiredScreenshareInputIdleValue(value));

                this.props.onSuccess();
            });
    }
}

export default connect()(ScreenshareInput);
