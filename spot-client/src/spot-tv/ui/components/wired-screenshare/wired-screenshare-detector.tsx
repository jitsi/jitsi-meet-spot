import {
    getInMeetingStatus,
    getWiredScreenshareInputIdleValue,
    getWiredScreenshareInputLabel,
    isDeviceConnectedForWiredScreensharing,
    isScreensharingAutoJoinEnabled,
    setSpotTVState,
    setWiredScreenshareDeviceConnected,
    setWiredScreenshareInputAvailable
} from 'common/app-state';
import { logger } from 'common/logger';
import { avUtils } from 'common/media';
import React from 'react';
import { connect } from 'react-redux';


import { wiredScreenshareService } from './../../../wired-screenshare-service';

interface IProps {
    dispatch: (action: any) => void;
    hasScreenshareDevice?: boolean;
    inMeeting?: string;
    isScreensharingAutoJoinEnabled?: boolean;
    wiredScreenshareDevice?: string;
    wiredScreenshareDeviceIdleValue?: number;
}

/**
 * Responsible for listening for wired screenshare connection updates and
 * updating the rest of the app.
 */
class WiredScreenshareDetector extends React.PureComponent<IProps> {
    /**
     * Initializes a new {@code WiredScreenshareChangeDetector} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
        super(props);

        this._onDeviceListChange = this._onDeviceListChange.bind(this);
        this._onWiredScreenshareChange
            = this._onWiredScreenshareChange.bind(this);
    }

    /**
     * Starts listening for the wired screensharing input to have a device be
     * connected or disconnected.
     *
     * @inheritdoc
     */
    componentDidMount() {
        if (this.props.wiredScreenshareDevice) {
            avUtils.enumerateVideoDevices()
                .then((deviceList: any) => this._onDeviceListChange(deviceList))
                .catch(() => logger.error(
                    'Screenshare detector failed to obtain device list'))
                .then(() => avUtils.listenForCameraDeviceListChange(
                    this._onDeviceListChange));
        }
    }

    /**
     * Updates the listener for wired screensharing input changes.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps: IProps) {
        const screensharingInputChanged
            = prevProps.wiredScreenshareDevice !== this.props.wiredScreenshareDevice;

        // This is a workaround for the USB dongle's issue where it sometimes gets stuck on
        // the last frame when the HDMI cable is disconnected. Redoing the GUM restores it
        // back to the black frame. The intention is to restart the VideoChangeListener
        // which should also redo the GUM.
        const meetingLeft = prevProps.inMeeting && !this.props.inMeeting;

        if (screensharingInputChanged || meetingLeft) {

            if (screensharingInputChanged) {
                logger.log('Screensharing input changed.');
            }
            if (meetingLeft) {
                logger.log('Meeting left - maybe will restart VideoChangeListener');
            }

            if (prevProps.wiredScreenshareDevice) {
                wiredScreenshareService.stopListeningForConnection(
                    prevProps.wiredScreenshareDevice,
                    this._onWiredScreenshareChange
                );
            }

            avUtils.enumerateVideoDevices()
                .then((deviceList: any) => this._onDeviceListChange(deviceList));
        }
    }

    /**
     * Cleans up an listeners that have been registered for detecting wired
     * screenshare changes.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        if (this.props.wiredScreenshareDevice) {
            wiredScreenshareService.stopListeningForConnection(
                this.props.wiredScreenshareDevice,
                this._onWiredScreenshareChange
            );
        }

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
     * @param deviceList - The list of available audio and
     * devices devices.
     * @private
     * @returns {void}
     */
    _onDeviceListChange(deviceList: any[]) {
        if (!this.props.wiredScreenshareDevice) {
            return;
        }

        const listHasSelectedScreenshareDevice = Boolean(deviceList.find(
            (device: any) => device.label === this.props.wiredScreenshareDevice));
        const { isScreensharingAutoJoinEnabled: autoJoinEnabled } = this.props;

        this.props.dispatch(setSpotTVState({
            wiredScreensharingEnabled: listHasSelectedScreenshareDevice
        }));

        this.props.dispatch(setWiredScreenshareInputAvailable(
            listHasSelectedScreenshareDevice));

        if (listHasSelectedScreenshareDevice && autoJoinEnabled) {
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
     * @param isDeviceConnected - Whether or not the wired
     * screensharing input now has or now does not have a device connected.
     * @private
     * @returns {void}
     */
    _onWiredScreenshareChange(isDeviceConnected: boolean) {
        if (isDeviceConnected !== this.props.hasScreenshareDevice) {
            logger.log(
                'Screensharing device connection changed',
                { isDeviceConnected }
            );

            this.props.dispatch(
                setWiredScreenshareDeviceConnected(isDeviceConnected));
        }
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code WiredScreenshareDetector}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: any) {
    const { inMeeting } = getInMeetingStatus(state);

    return {
        hasScreenshareDevice: isDeviceConnectedForWiredScreensharing(state),
        inMeeting,
        isScreensharingAutoJoinEnabled: isScreensharingAutoJoinEnabled(state),
        wiredScreenshareDevice: getWiredScreenshareInputLabel(state),
        wiredScreenshareDeviceIdleValue:
            getWiredScreenshareInputIdleValue(state)
    };
}

export default connect(mapStateToProps)(WiredScreenshareDetector);
