import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    getInMeetingStatus,
    getWiredScreenshareInputIdleValue,
    getWiredScreenshareInputLabel,
    isDeviceConnectedForWiredScreensharing,
    setSpotTVState,
    setWiredScreenshareDeviceConnected
} from 'common/app-state';
import { logger } from 'common/logger';
import { avUtils } from 'common/media';

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
        inMeeting: PropTypes.string,
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
        // Let's fake the call to get video devices if there is no input device
        // set. This avoid a call to gUM and the camera light flashing.
        const getVideoDevicePromise = this.props.wiredScreenshareDevice
            ? avUtils.enumerateVideoDevices()
            : Promise.resolve([]);

        getVideoDevicePromise
            .then(deviceList => this._onDeviceListChange(deviceList))
            .catch(error => logger.error(
                'Screenshare detector failed to obtain device list', { error }))
            .then(() => avUtils.listenForCameraDeviceListChange(
                this._onDeviceListChange));
    }

    /**
     * Updates the listener for wired screensharing input changes.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        const screensharingInputChanged
            = prevProps.wiredScreenshareDevice !== this.props.wiredScreenshareDevice;

        // This is a workaround for the USB dongle's issue where it sometimes gets stuck on
        // the last frame when the HDMI cable is disconnected. Redoing the GUM restores it
        // back to the black frame. The intention is to restart the VideoChangeListener
        // which should also redo the GUM.
        const meetingLeft = prevProps.inMeeting && !this.props.inMeeting;

        if (screensharingInputChanged || meetingLeft) {

            screensharingInputChanged && logger.log('Screensharing input changed.');
            meetingLeft && logger.log('Meeting left - maybe will restart VideoChangeListener');

            wiredScreenshareService.stopListeningForConnection(
                prevProps.wiredScreenshareDevice,
                this._onWiredScreenshareChange,
            );

            avUtils.enumerateVideoDevices()
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

        avUtils.stopListeningForCameraDeviceListChange(
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
    _onDeviceListChange(deviceList = []) {
        if (!this.props.wiredScreenshareDevice) {
            this.props.dispatch(setSpotTVState({
                wiredScreensharingEnabled: false
            }));

            return;
        }

        const listHasSelectedScreenshareDevice = Boolean(deviceList.find(
            device => device.label === this.props.wiredScreenshareDevice));

        this.props.dispatch(setSpotTVState({
            wiredScreensharingEnabled: listHasSelectedScreenshareDevice
        }));

        if (listHasSelectedScreenshareDevice) {
            wiredScreenshareService.startListeningForConnection(
                this.props.wiredScreenshareDevice,
                this._onWiredScreenshareChange,
                this.props.wiredScreenshareDeviceIdleValue);

        } else {
            wiredScreenshareService.stopListeningForConnection(
                this.props.wiredScreenshareDevice,
                this._onWiredScreenshareChange);
            this._onWiredScreenshareChange(false);
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
            logger.log(
                'Screensharing device connection changed',
                { isDeviceConnected }
            );

            this.props.dispatch(
                setWiredScreenshareDeviceConnected(isDeviceConnected));
            this.props.dispatch(setSpotTVState({
                wiredScreensharingEnabled: isDeviceConnected
            }));
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
    const { inMeeting } = getInMeetingStatus(state);

    return {
        hasScreenshareDevice: isDeviceConnectedForWiredScreensharing(state),
        inMeeting,
        wiredScreenshareDevice: getWiredScreenshareInputLabel(state),
        wiredScreenshareDeviceIdleValue:
            getWiredScreenshareInputIdleValue(state)
    };
}

export default connect(mapStateToProps)(WiredScreenshareDetector);
