import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    getPreferredCamera,
    getPreferredMic,
    getPreferredSpeaker,
    getWiredScreenshareInputLabel,
    setPreferredDevices,
    setWiredScreenshareInputIdleValue,
    setWiredScreenshareInputLabel
} from 'common/app-state';
import { Button } from 'common/ui';
import { avUtils } from 'common/media';

import CameraPreview from './camera-preview';
import MicPreview from './mic-preview';
import MediaSelector from './media-selector';
import SpeakerPreview from './speaker-preview';

import { wiredScreenshareService } from './../../../../wired-screenshare-service';

/**
 * Displays a selector for choosing a media source.
 *
 * @extends React.Component
 */
class SelectMedia extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        onSuccess: PropTypes.func,
        preferredCamera: PropTypes.string,
        preferredMic: PropTypes.string,
        preferredScreenshareDongle: PropTypes.string,
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
            ...this._getDefaultDeviceListState(),
            selectedCamera: props.preferredCamera,
            selectedMic: props.preferredMic,
            selectedScreenshareDongle: props.preferredScreenshareDongle,
            selectedSpeaker: props.preferredSpeaker
        };

        this._onCameraChange = this._onCameraChange.bind(this);
        this._onDeviceListChange = this._onDeviceListChange.bind(this);
        this._onMicChange = this._onMicChange.bind(this);
        this._onScreenshareChange = this._onScreenshareChange.bind(this);
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
            screenshareDongles,
            selectedCamera,
            selectedMic,
            selectedScreenshareDongle,
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
        const screenshareSelect = (
            <MediaSelector
                device = { selectedScreenshareDongle }
                devices = { screenshareDongles }
                key = 'screenshare'
                label = 'Screen sharing'
                onChange = { this._onScreenshareChange }
                qaId = 'screenshare'
                type = 'screenshare' />
        );

        return (
            <div className = 'spot-setup select-media'>
                <div className = 'setup-title'>
                    Setup your devices
                </div>
                <div className = 'columns'>
                    <div className = 'column'>
                        { cameraSelect }
                        { micSelect }
                        { speakerSelect }
                        { screenshareSelect }
                    </div>
                    <div className = 'column'>
                        <div className = 'select-label'>Preview</div>
                        <div className = 'camera-preview-container'>
                            <CameraPreview
                                devices = { cameras }
                                label = { selectedCamera } />
                        </div>
                        <SpeakerPreview
                            devices = { speakers }
                            label = { selectedSpeaker }
                            src = 'dist/ring.wav' />
                        <MicPreview
                            devices = { mics }
                            label = { selectedMic } />
                    </div>
                </div>
                <div className = 'setup-buttons'>
                    <Button
                        onClick = { this._onSubmit }
                        qaId = 'device-selection-submit'>
                        Next
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
     * Returns the state keys and values to use for tracking selectable
     * devices.
     *
     * @private
     * @returns {Object}
     */
    _getDefaultDeviceListState() {
        return {
            cameras: [],
            mics: [],
            screenshareDongles: [
                {
                    label: 'None',
                    value: ''
                }
            ],
            speakers: []
        };
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
     * as provided by enumerateDevices.
     * @private
     * @returns {void}
     */
    _onDeviceListChange(devices) {
        const newDeviceLists = this._getDefaultDeviceListState();

        devices.forEach(({ deviceId, kind, label }) => {
            const formatted = {
                deviceId,
                label,
                value: label
            };

            switch (kind) {
            case 'videoinput':
                newDeviceLists.cameras.push(formatted);
                newDeviceLists.screenshareDongles.push(formatted);
                break;
            case 'audioinput':
                newDeviceLists.mics.push(formatted);
                break;
            case 'audiooutput':
                newDeviceLists.speakers.push(formatted);
                break;
            }
        });

        this.setState(newDeviceLists);
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
     * Callback invoked when the selected screenshare dongle has changed.
     *
     * @param {string} label - The label of the selected device.
     * @private
     * @returns {void}
     */
    _onScreenshareChange(label) {
        this.setState({
            selectedScreenshareDongle: label
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
     * Callback invoked to proceed to the save changes to the selected devices
     * and proceed to the next step of setup.
     *
     * @private
     * @returns {void}
     */
    _onSubmit() {
        const {
            selectedCamera,
            selectedMic,
            selectedScreenshareDongle,
            selectedSpeaker
        } = this.state;

        this.props.dispatch(setPreferredDevices(
            selectedCamera,
            selectedMic,
            selectedSpeaker
        ));

        if (selectedScreenshareDongle) {
            const changeListener
                = wiredScreenshareService.getVideoChangeListener(selectedScreenshareDongle);

            changeListener.start()
                .then(() => {
                    const value = changeListener.getCurrentValue();

                    changeListener.destroy();

                    this.props.dispatch(setWiredScreenshareInputLabel(selectedScreenshareDongle));
                    this.props.dispatch(setWiredScreenshareInputIdleValue(value));
                });
        } else {
            this.props.dispatch(setWiredScreenshareInputLabel());
            this.props.dispatch(setWiredScreenshareInputIdleValue());
        }

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
        preferredScreenshareDongle: getWiredScreenshareInputLabel(state),
        preferredSpeaker: getPreferredSpeaker(state)
    };
}

export default connect(mapStateToProps)(SelectMedia);
