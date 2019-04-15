import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    getPreferredCamera,
    getPreferredMic,
    getPreferredSpeaker,
    setPreferredDevices
} from 'common/app-state';
import { Button } from 'common/ui';
import { avUtils } from 'common/media';

import CameraPreview from './camera-preview';
import MicPreview from './mic-preview';
import MediaSelector from './media-selector';
import SpeakerPreview from './speaker-preview';

/**
 * Displays a selector for choosing a media source.
 *
 * @extends React.Component
 */
class SelectMedia extends React.Component {
    static defaultProps = {
        preferredCamera: '',
        preferredMic: '',
        preferredSpeaker: ''
    };

    static propTypes = {
        dispatch: PropTypes.func,
        onSuccess: PropTypes.func,
        preferredCamera: PropTypes.string,
        preferredMic: PropTypes.string,
        preferredSpeaker: PropTypes.string
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
            selectedCamera: props.preferredCamera,
            selectedMic: props.preferredMic,
            selectedSpeaker: props.preferredSpeaker,
            speakers: []
        };

        this._onCameraChange = this._onCameraChange.bind(this);
        this._onDeviceListChange = this._onDeviceListChange.bind(this);
        this._onMicChange = this._onMicChange.bind(this);
        this._onSkip = this._onSkip.bind(this);
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
        avUtils.listenForDeviceListChange(this._onDeviceListChange);

        this._getDevices();
    }

    /**
     * Stops listening for updates to the list of connected devices.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        avUtils.stopListeningForDeviceListChange(
            this._onDeviceListChange);
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
            <MediaSelector
                device = { selectedCamera }
                devices = { cameras }
                key = 'camera'
                label = 'Camera'
                onChange = { this._onCameraChange }
                type = 'camera' />
        );
        const micSelect = (
            <MediaSelector
                device = { selectedMic }
                devices = { mics }
                key = 'mic'
                label = 'Microphone'
                onChange = { this._onMicChange }
                type = 'mic' />
        );
        const speakerSelect = (
            <MediaSelector
                device = { selectedSpeaker }
                devices = { speakers }
                key = 'speaker'
                label = 'Speaker'
                onChange = { this._onSpeakerChange }
                type = 'speaker' />
        );

        return (
            <div className = 'spot-setup select-media'>
                <div className = 'setup-title'>
                    Select your devices
                </div>
                <div className = 'columns'>
                    <div className = 'column'>
                        { cameraSelect }
                        { micSelect }
                        { speakerSelect }
                    </div>
                    <div className = 'column'>
                        <div className = 'camera-preview'>
                            <CameraPreview
                                devices = { cameras }
                                label = { selectedCamera } />
                        </div>
                    </div>
                </div>
                <div className = 'columns'>
                    <div className = 'column'>
                        <SpeakerPreview
                            devices = { speakers }
                            label = { selectedSpeaker }
                            src = 'dist/ring.wav' />
                    </div>
                    <div className = 'column'>
                        <MicPreview
                            devices = { mics }
                            label = { selectedMic } />
                    </div>
                </div>
                <div className = 'setup-buttons'>
                    <Button onClick = { this._onSubmit }>
                        Save
                    </Button>
                    <Button
                        appearance = 'subtle'
                        onClick = { this._onSkip }>
                        Skip
                    </Button>
                </div>
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
        avUtils.createLocalTracks()
            .then(tracks => tracks.forEach(track => track.dispose()))
            .then(() => avUtils.enumerateDevices())
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
     * Callback invoked to proceed to the next step of setup without saving
     * and device preferences.
     *
     * @private
     * @returns {void}
     */
    _onSkip() {
        this.props.onSuccess();
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
     * @private
     * @returns {void}
     */
    _onSubmit() {
        this.props.dispatch(setPreferredDevices(
            this.state.selectedCamera,
            this.state.selectedMic,
            this.state.selectedSpeaker
        ));

        this.props.onSuccess();
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code SelectMedia}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        preferredCamera: getPreferredCamera(state),
        preferredMic: getPreferredMic(state),
        preferredSpeaker: getPreferredSpeaker(state)
    };
}

export default connect(mapStateToProps)(SelectMedia);
