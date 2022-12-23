import { logger } from 'common/logger';
import { avUtils } from 'common/media';
import PropTypes from 'prop-types';
import React from 'react';


import PreviewTrack from './PreviewTrack';

/**
 * Displays a volume meter for previewing the selected audio input device.
 */
export default class MicPreview extends React.PureComponent {
    static propTypes = {
        devices: PropTypes.array,
        label: PropTypes.string
    };

    /**
     * Initializes a new {@code MicPreview} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            audioLevel: 0,
            micPreviewTrack: null
        };

        this._ref = React.createRef();
        this._updateAudioLevel = this._updateAudioLevel.bind(this);
    }

    /**
     * Begins listening on the selected audio input device, if specified, for
     * changes in volume.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._createPreviewTrack();
    }

    /**
     * Updates which audio input device is being listened to for changes in
     * volume.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (this.props !== prevProps) {
            this._createPreviewTrack();
        }
    }

    /**
     * Cleans up any audio tracks used for previewing.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this._destroyPreviewTrack();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const {
            audioLevel,
            loading,
            micPreviewTrack
        } = this.state;

        const audioMeterFill = {
            width: `${Math.floor(audioLevel * 100)}%`
        };

        return (
            <div className = { `mic-preview ${micPreviewTrack || loading ? '' : 'disabled'}` } >
                <div
                    className = 'mic-preview-level'
                    style = { audioMeterFill } />
            </div>
        );
    }

    /**
     * Creates the audio track to use to listen for volume changes and update
     * the volume preview.
     *
     * @private
     * @returns {void}
     */
    _createPreviewTrack() {
        const description = this.props.devices.find(device =>
            device.label === this.props.label);

        if (!description) {
            this._destroyPreviewTrack();

            return;
        }

        if (this.state.micPreviewTrack
            && this.state.micPreviewTrack.isMatchindDeviceId(description.deviceId)) {
            return;
        }

        const setLoadingPromise = new Promise(resolve =>
            this.setState({ loading: true }, resolve));

        setLoadingPromise
            .then(() => this._destroyPreviewTrack())
            .then(() => {
                const previewTrack = new PreviewTrack('audio', description.deviceId);

                return previewTrack.createPreview();
            })
            .then(previewTrack => {
                previewTrack.addListener(
                    avUtils.getTrackEvents().TRACK_AUDIO_LEVEL_CHANGED,
                    this._updateAudioLevel
                );

                this.setState({
                    micPreviewTrack: previewTrack
                });
            })
            .catch(error => {
                logger.error('Mic preview failed', { error });
            })
            .then(() => {
                this.setState({
                    loading: false
                });
            });
    }

    /**
     * Cleans up the audio track used for previewing.
     *
     * @private
     * @returns {Promise}
     */
    _destroyPreviewTrack() {
        if (!this.state.micPreviewTrack) {
            return Promise.resolve();
        }

        this.state.micPreviewTrack.destroy();

        return new Promise(resolve => this.setState({ micPreviewTrack: null }, resolve));
    }

    /**
     * Updates the known current volume level of the audio input. The passed in
     * level will be a number between 0 and 1.
     *
     * @param {number} audioLevel - The new audio level for the track.
     * @private
     * @returns {void}
     */
    _updateAudioLevel(audioLevel) {
        this.setState({ audioLevel });
    }
}
