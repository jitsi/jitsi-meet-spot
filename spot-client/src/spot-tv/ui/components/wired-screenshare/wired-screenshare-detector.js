import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    getWiredScreenshareInputIdleValue,
    getWiredScreenshareInputLabel,
    isDeviceConnectedForWiredScreensharing,
    setWiredScreenshareDeviceConnected,
    setWiredScreenshareInputAvailable
} from 'common/app-state';
import { logger } from 'common/logger';

import { wiredScreenshareService } from './../../../wired-screenshare-service';

/**
 * Responsible for listening for wired screenshare connection updates and
 * updating the rest of the app about the state.
 *
 * @extends React.Component
 */
class WiredScreenshareDetector extends React.PureComponent {
    static propTypes = {
        dispatch: PropTypes.func,
        hasScreenshareDevice: PropTypes.bool,
        remoteControlService: PropTypes.object,
        wiredScreenshareDevice: PropTypes.string,
        wiredScreenshareDeviceIdleValue: PropTypes.number
    };

    /**
     * Initializes a new {@code WiredScreenshareChangeDetector} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onDeviceListChange = this._onDeviceListChange.bind(this);
        this._onWiredScreenshareChange
            = this._onWiredScreenshareChange.bind(this);
    }

    /**
     * Starts listening for the wired screensharing input to have a device be
     * connected.
     *
     * @inheritdoc
     */
    componentDidMount() {
        if (this.props.wiredScreenshareDevice) {
            wiredScreenshareService.getVideoInputDevices()
                .then(deviceList => this._onDeviceListChange(deviceList))
                .catch(() => logger.error(
                    'Screenshare detector failed to obtain device list'))
                .then(() =>
                    wiredScreenshareService.startListeningForDeviceChange(
                        this._onDeviceListChange));
        }
    }

    /**
     * Updates the listener for wired screensharing input changes.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (prevProps.wiredScreenshareDevice
            !== this.props.wiredScreenshareDevice) {
            logger.log('Screensharing input changed.');

            wiredScreenshareService.stopListeningForConnection(
                prevProps.wiredScreenshareDevice,
                this._onWiredScreenshareChange,
            );

            wiredScreenshareService.getVideoInputDevices()
                .then(deviceList => this._onDeviceListChange(deviceList));
        }
    }

    /**
     * Starts listening for the wired screensharing input to have a device be
     * connected.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        wiredScreenshareService.stopListeningForConnection(
            this.props.wiredScreenshareDevice,
            this._onWiredScreenshareChange
        );

        wiredScreenshareService.stopListeningForDeviceChange(
            this._onDeviceListChange);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return null;
    }

    /**
     * Callback invoked when the list of connected camera devices has changed.
     * Updates known state of whether or not the selected screensharing device,
     * if any, is connected.
     *
     * @param {Array<Object>} deviceList - Eats honey.
     * @private
     * @returns {void}
     */
    _onDeviceListChange(deviceList) {
        if (!this.props.wiredScreenshareDevice) {
            return;
        }

        const listHasSelectedScreenshareDevice = Boolean(deviceList.find(
            device => device.label === this.props.wiredScreenshareDevice));

        this.props.remoteControlService.notifyWiredScreenshareEnabled(
            listHasSelectedScreenshareDevice);

        this.props.dispatch(setWiredScreenshareInputAvailable(
            listHasSelectedScreenshareDevice));

        if (listHasSelectedScreenshareDevice) {
            wiredScreenshareService.startListeningForConnection(
                this.props.wiredScreenshareDevice,
                this._onWiredScreenshareChange,
                this.props.wiredScreenshareDeviceIdleValue);

        } else {
            wiredScreenshareService.stopListeningForConnection(
                this.props.wiredScreenshareDevice,
                this._onWiredScreenshareChange);
        }
    }

    /**
     * Callback invoked when a device has been connected or disconnected from
     * the screensharing input.
     *
     * @param {boolean} isDeviceConnected - Whether or not the wired
     * screensharing input now has or now does not have a device connected.
     * @private
     * @returns {void}
     */
    _onWiredScreenshareChange(isDeviceConnected) {
        if (isDeviceConnected !== this.props.hasScreenshareDevice) {
            logger.log(`Screensharing device connection changing to ${
                isDeviceConnected}`);

            this.props.dispatch(
                setWiredScreenshareDeviceConnected(isDeviceConnected));
        }
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code WiredScreenshareDetector}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        hasScreenshareDevice: isDeviceConnectedForWiredScreensharing(state),
        wiredScreenshareDevice: getWiredScreenshareInputLabel(state),
        wiredScreenshareDeviceIdleValue:
            getWiredScreenshareInputIdleValue(state)
    };
}

export default connect(mapStateToProps)(WiredScreenshareDetector);
