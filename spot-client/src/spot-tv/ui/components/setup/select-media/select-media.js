import {
    addNotification,
    getPreferredCamera,
    getPreferredMic,
    getPreferredResolution,
    getPreferredSpeaker,
    getWiredScreenshareInputLabel,
    setPreferredDevices,
    setPreferredResolution,
    setSpotTVState,
    setWiredScreenshareInputIdleValue,
    setWiredScreenshareInputLabel
} from 'common/app-state';
import { logger } from 'common/logger';
import { avUtils } from 'common/media';
import { Button } from 'common/ui';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { wiredScreenshareService } from './../../../../wired-screenshare-service';
import CameraPreview from './camera-preview';
import MediaSelector from './media-selector';
import MicPreview from './mic-preview';
import SpeakerPreview from './speaker-preview';


/**
 * @typedef {Object} Device
 * @property {string} deviceId - The WebRTC device id for the device.
 * @property {string} label - The WebRTC label for the device. To be displayed
 * in dropdowns.
 * @property {string} value - The value to be returned when the device is
 * selected in a dropdown.
 */

/**
 * Displays a selector for choosing a media source.
 */
class SelectMedia extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        onSuccess: PropTypes.func,
        preferredCamera: PropTypes.string,
        preferredMic: PropTypes.string,
        preferredResolution: PropTypes.string,
        preferredScreenshareDongle: PropTypes.string,
        preferredSpeaker: PropTypes.string,
        t: PropTypes.func
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
            saving: false,
            selectedCamera: props.preferredCamera,
            selectedMic: props.preferredMic,
            selectedResolution: props.preferredResolution,
            selectedScreenshareDongle: props.preferredScreenshareDongle,
            selectedSpeaker: props.preferredSpeaker
        };

        this._onCameraChange = this._onCameraChange.bind(this);
        this._onDeviceListChange = this._onDeviceListChange.bind(this);
        this._onMicChange = this._onMicChange.bind(this);
        this._onResolutionChange = this._onResolutionChange.bind(this);
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
            resolutions,
            saving,
            screenshareDongles,
            selectedCamera,
            selectedMic,
            selectedResolution,
            selectedScreenshareDongle,
            selectedSpeaker,
            speakers
        } = this.state;
        const {
            t
        } = this.props;
        const cameraSelect = (
            <MediaSelector
                device = { selectedCamera }
                devices = { cameras }
                key = 'camera'
                label = { t('setup.videoIn') }
                onChange = { this._onCameraChange }
                type = 'camera' />
        );
        const resolutionSelect = (
            <MediaSelector
                device = { selectedResolution }
                devices = { resolutions }
                key = 'resolution'
                label = { t('setup.resolutionLabel') }
                onChange = { this._onResolutionChange }
                type = 'resolution' />
        );
        const micSelect = (
            <MediaSelector
                device = { selectedMic }
                devices = { mics }
                key = 'mic'
                label = { t('setup.audioIn') }
                onChange = { this._onMicChange }
                type = 'mic' />
        );
        const speakerSelect = (
            <MediaSelector
                device = { selectedSpeaker }
                devices = { speakers }
                key = 'speaker'
                label = { t('setup.audioOut') }
                onChange = { this._onSpeakerChange }
                type = 'speaker' />
        );
        const screenshareSelect = (
            <MediaSelector
                device = { selectedScreenshareDongle }
                devices = { screenshareDongles }
                id = 'screenshare'
                key = 'screenshare'
                label = { t('setup.screenShare') }
                onChange = { this._onScreenshareChange }
                qaId = 'screenshare'
                type = 'screenshare' />
        );

        return (
            <div className = 'spot-setup select-media'>
                <div className = 'setup-title'>
                    { t('setup.devices') }
                </div>
                <div className = 'columns'>
                    <div className = 'column'>
                        { cameraSelect }
                        { resolutionSelect }
                        { micSelect }
                        { speakerSelect }
                        { screenshareSelect }
                    </div>
                    <div className = 'column'>
                        <div className = 'select-label'>
                            { t('setup.preview') }
                        </div>
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
                        className = 'device-selection-submit'
                        disabled = { saving }
                        onClick = { this._onSubmit }
                        qaId = 'device-selection-submit'>
                        { t('buttons.next') }
                    </Button>
                    <Button
                        appearance = 'subtle'
                        disabled = { saving }
                        onClick = { this._onSkip }>
                        { t('buttons.skip') }
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
        avUtils.hasDevicePermission()
            .then(hasPermission => {
                if (!hasPermission) {
                    // Force device permission request.
                    return avUtils.createLocalTracks()
                        .then(tracks => tracks.forEach(track => track.dispose()));
                }
            })
            .then(() => avUtils.enumerateDevices())
            .then(this._onDeviceListChange);
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
            resolutions: [
                {
                    label: this.props.t('setup.noSelection'),
                    value: ''
                }, {
                    label: this.props.t('setup.resolutionHighDef'),
                    value: '720'
                }, {
                    label: this.props.t('setup.resolutionFullHighDef'),
                    value: '1080'
                }, {
                    label: this.props.t('setup.resolutionUltraHighDef'),
                    value: '2160'
                }
            ],
            mics: [],
            screenshareDongles: [
                {
                    label: this.props.t('setup.noSelection'),
                    value: ''
                }
            ],
            speakers: []
        };
    }

    /**
     * Returns devices that do not match the selected camera.
     *
     * @param {Array<Device>} devices - The list of Device instances to filter
     * through to remove the selected camera.
     * @param {string} selectedCamera - The label of the camera which has been
     * currently chosen for use.
     * @returns {Array<Device>}
     */
    _getFilteredScreenshareDongles(devices, selectedCamera) {
        return [
            ...devices.filter(device =>
                !selectedCamera || device.label !== selectedCamera)
        ];
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
            screenshareDongles: [
                ...this._getDefaultDeviceListState().screenshareDongles,
                ...this._getFilteredScreenshareDongles(
                    this.state.cameras,
                    label
                )
            ],
            selectedCamera: label,
            selectedScreenshareDongle: label === this.state.selectedScreenshareDongle
                ? '' : this.state.selectedScreenshareDongle
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
                break;
            case 'audioinput':
                newDeviceLists.mics.push(formatted);
                break;
            case 'audiooutput':
                newDeviceLists.speakers.push(formatted);
                break;
            }
        });

        newDeviceLists.screenshareDongles = [
            ...newDeviceLists.screenshareDongles,
            ...this._getFilteredScreenshareDongles(
                newDeviceLists.cameras,
                this.state.selectedCamera
            )
        ];

        this.setState(newDeviceLists);
    }

    /**
     * Callback invoked when the selected resolution has changed.
     *
     * @param {string} resolution - The selected resolution.
     * @private
     * @returns {void}
     */
    _onResolutionChange(resolution) {
        this.setState({
            selectedResolution: resolution
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
     * Callback invoked when the selected screenshare dongle has changed.
     *
     * @param {string} label - The label of the selected device.
     * @private
     * @returns {void}
     */
    _onScreenshareChange(label) {
        this.setState({
            selectedScreenshareDongle: this.state.selectedCamera === label
                ? '' : label
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
            selectedResolution,
            selectedScreenshareDongle,
            selectedSpeaker
        } = this.state;

        const showSavingStatePromise = new Promise(resolve =>
            this.setState({ saving: true }, resolve));

        showSavingStatePromise
            .then(() => {
                if (selectedScreenshareDongle) {
                    const changeListener
                        = wiredScreenshareService.getVideoChangeListener(selectedScreenshareDongle);

                    return changeListener.start()
                        .then(() => {
                            const value = changeListener.getCurrentValue();

                            changeListener.destroy();

                            this.props.dispatch(setWiredScreenshareInputLabel(selectedScreenshareDongle));
                            this.props.dispatch(setWiredScreenshareInputIdleValue(value));
                        });
                }

                this.props.dispatch(setWiredScreenshareInputLabel());
                this.props.dispatch(setWiredScreenshareInputIdleValue());
            })
            .then(() => {
                this.props.dispatch(setPreferredDevices(
                    selectedCamera,
                    selectedMic,
                    selectedSpeaker
                ));

                this.props.dispatch(setPreferredResolution(
                    selectedResolution
                ));

                this.props.dispatch(setSpotTVState({
                    wiredScreensharingEnabled: Boolean(selectedScreenshareDongle)
                }));
            })
            .then(() => this.props.onSuccess())
            .catch(error => {
                logger.error('Error while saving preferences', { error });

                this.props.dispatch(addNotification('error', 'appEvents.devicesNotSaved'));

                this.setState({ saving: false });
            });
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
        preferredResolution: getPreferredResolution(state),
        preferredScreenshareDongle: getWiredScreenshareInputLabel(state),
        preferredSpeaker: getPreferredSpeaker(state)
    };
}

export default connect(mapStateToProps)(withTranslation()(SelectMedia));
