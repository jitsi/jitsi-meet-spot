import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { Button } from 'common/ui';
import { JitsiMeetJSProvider } from 'common/vendor';

import CameraPreview from './camera-preview';
import MicPreview from './mic-preview';
import Selector from './selector';
import SpeakerPreview from './speaker-preview';

/**
 * Displays a selector for choosing a media source.
 *
 * @extends React.Component
 */
class SelectMedia extends React.Component {
    static propTypes = {
        onSuccess: PropTypes.func
    };

    /**
     * Initializes a new {@code SelectMedia} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            cameras: [],
            mics: [],
            selectedCamera: '',
            selectedMic: '',
            selectedSpeaker: '',
            speakers: []
        };

        this._onCameraChange = this._onCameraChange.bind(this);
        this._onDeviceListChange = this._onDeviceListChange.bind(this);
        this._onMicChange = this._onMicChange.bind(this);
        this._onSpeakerChange = this._onSpeakerChange.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
    }

    /**
     * Fetches and stores available devices and starts listening for updates
     * to connected devices.
     *
     * @inheritdoc
     */
    componentDidMount() {
        const JitsiMeetJS = JitsiMeetJSProvider.get();

        JitsiMeetJS.mediaDevices.addEventListener(
            JitsiMeetJS.events.mediaDevices.DEVICE_LIST_CHANGED,
            this._onDeviceListChange
        );

        this._getDevices();
    }

    /**
     * Stops listening for updates to the list of connected devices.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        const JitsiMeetJS = JitsiMeetJSProvider.get();

        JitsiMeetJS.mediaDevices.removeEventListener(
            JitsiMeetJS.events.mediaDevices.DEVICE_LIST_CHANGED,
            this._onDeviceListChange
        );
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const {
            cameras,
            mics,
            selectedCamera,
            selectedMic,
            selectedSpeaker,
            speakers
        } = this.state;
        const cameraSelect = (
            <Selector
                device = { selectedCamera }
                devices = { cameras }
                key = 'camera'
                onChange = { this._onCameraChange }
                type = 'camera' />
        );
        const micSelect = (
            <Selector
                device = { selectedMic }
                devices = { mics }
                key = 'mic'
                onChange = { this._onMicChange }
                type = 'mic' />
        );
        const speakerSelect = (
            <Selector
                device = { selectedSpeaker }
                devices = { speakers }
                key = 'speaker'
                onChange = { this._onSpeakerChange }
                type = 'speaker' />
        );

        return (
            <div className = 'setup-step'>
                <div className = 'setup-title'>
                    Select your devices
                </div>
                { cameraSelect }
                { micSelect }
                { speakerSelect }
                <div>
                    Note: saving of devices not yet implemented
                </div>
                <CameraPreview
                    devices = { cameras }
                    label = { selectedCamera } />
                <MicPreview
                    devices = { mics }
                    label = { selectedMic } />
                <SpeakerPreview
                    devices = { speakers }
                    label = { selectedSpeaker }
                    src = 'dist/ring.wav' />
                <div className = 'setup-buttons'>
                    <Button onClick = { this._onSubmit }>
                        Save
                    </Button>
                </div>
            </div>
        );
    }

    /**
     * Renders a {@code Selector} for choosing a media source.
     *
     * @param {Object} options - Details of how to render the {@code Selector}.
     * @param {string} type - The media source (hardware) type.
     * @param {Array<Object>} devices - The list of devices related to the
     * type. The objects are instances of MediaDeviceInfo as passed back by
     * enumerateDevices.
     * @param {Function} onChange - Callback invoked when a new selection has
     * been made.
     * @private
     * @returns {Selector}
     */
    _createSelect({ type, devices, device, onChange }) {
        const selections = devices.map(({ label }) => (
            <option
                key = { label }
                value = { label }>
                { label }
            </option>
        ));

        if (!device) {
            selections.unshift(
                <option
                    key = 'default'
                    value = ''>
                    Please select a device
                </option>
            );
        }

        return (
            <div>
                Select a { type }:
                <select
                    key = { type }
                    onChange = { onChange }
                    value = { device }>
                    {
                        selections
                    }
                </select>
            </div>
        );
    }

    /**
     * Gets media permissions and then gets a list of all connected media
     * devices.
     *
     * @private
     * @returns {void}
     */
    _getDevices() {
        const JitsiMeetJS = JitsiMeetJSProvider.get();

        JitsiMeetJS.createLocalTracks({ devices: [ 'audio', 'video' ] })
            .then(tracks => tracks.forEach(track => track.dispose()))
            .then(() => new Promise(
                resolve => JitsiMeetJS.mediaDevices.enumerateDevices(resolve)
            ))
            .then(devices => {
                this._onDeviceListChange(devices);
            });
    }

    /**
     * Callback invoked when the selected camera (videoinput) has changed.
     *
     * @param {string} label - The label of the selected device.
     * @private
     * @returns {void}
     */
    _onCameraChange(label) {
        this.setState({
            selectedCamera: label
        });
    }

    /**
     * Separates the passed in list of MediaDeviceInfos into each media device
     * type and updates the known state of connected devices.
     *
     * @param {Array<Object>} devices - The list of MediaDeviceInfos instances
     * as provied by enumerateDevices.
     * @private
     * @returns {void}
     */
    _onDeviceListChange(devices) {
        const cameras = [];
        const mics = [];
        const speakers = [];

        devices.forEach(device => {
            switch (device.kind) {
            case 'videoinput':
                cameras.push(device);
                break;
            case 'audioinput':
                mics.push(device);
                break;
            case 'audiooutput':
                speakers.push(device);
                break;
            }
        });

        this.setState({
            cameras,
            mics,
            speakers
        });
    }

    /**
     * Callback invoked when the selected mic (audioinput) has changed.
     *
     * @param {string} label - The label of the selected device.
     * @private
     * @returns {void}
     */
    _onMicChange(label) {
        this.setState({
            selectedMic: label
        });
    }

    /**
     * Callback invoked when the selected speaker (audiooutput) has changed.
     *
     * @param {string} label - The label of the selected device.
     * @private
     * @returns {void}
     */
    _onSpeakerChange(label) {
        this.setState({
            selectedSpeaker: label
        });
    }

    /**
     * Callback invoked to proceed to the next step of setup.
     *
     * @inheritdoc
     */
    _onSubmit() {
        this.props.onSuccess();
    }
}

export default connect()(SelectMedia);
