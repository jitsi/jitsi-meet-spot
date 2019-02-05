import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setScreenshareDevice } from 'actions';
import { Button } from 'features/button';
import { JitsiMeetJSProvider } from 'vendor';

/**
 * Displays a picker for selecting a video input device to use while
 * performing a wired screenshare.
 *
 * @extends React.Component
 */
class ScreenshareInput extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        onSuccess: PropTypes.func,
        remoteControlService: PropTypes.object
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
        const JitsiMeetJS = JitsiMeetJSProvider.get();

        // First call gUM in order to populate labels from enumerateDevices.
        JitsiMeetJS.createLocalTracks({ devices: [ 'video' ] })
            .then(tracks => tracks.forEach(track => track.dispose()))
            .then(() => new Promise(
                resolve => JitsiMeetJS.mediaDevices.enumerateDevices(resolve)
            ))
            .then(devices => {
                this.setState({
                    devices:
                        devices.filter(device => device.kind === 'videoinput')
                });
            });
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
        this._selectDevice();
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
    _selectDevice(label = '') {
        this.props.dispatch(setScreenshareDevice(label));
        this.props.onSuccess();
    }
}

export default connect()(ScreenshareInput);
