import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    getScreenshareDevice,
    getScreenshareDeviceIdleValue,
    isScreenShareDeviceConnect,
    setScreenshareDeviceConnected
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
        wiredScreenshareService.startListeningForConnection(
            this.props.wiredScreenshareDevice,
            this._onWiredScreenshareChange,
            this.props.wiredScreenshareDeviceIdleValue
        );
    }

    /**
     * Updates the listener for wired screensharing input changes.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (prevProps.wiredScreenshareDevice
            !== this.props.wiredScreenshareDevice) {
            logger.log('Screensharing input changed. Updating listener.');

            wiredScreenshareService.stopListeningForConnection(
                prevProps.wiredScreenshareDevice,
                this._onWiredScreenshareChange,
            );

            wiredScreenshareService.startListeningForConnection(
                this.props.wiredScreenshareDevice,
                this._onWiredScreenshareChange,
                this.props.wiredScreenshareDeviceIdleValue
            );
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
                setScreenshareDeviceConnected(isDeviceConnected));
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
        hasScreenshareDevice: isScreenShareDeviceConnect(state),
        wiredScreenshareDevice: getScreenshareDevice(state),
        wiredScreenshareDeviceIdleValue:
            getScreenshareDeviceIdleValue(state)
    };
}

export default connect(mapStateToProps)(WiredScreenshareDetector);
