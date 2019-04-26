import PropTypes from 'prop-types';
import React from 'react';

import { avUtils } from 'common/media';

/**
 * Displays a volume meter for previewing the selected audio input device.
 *
 * @extends React.PureComponent
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
            audioLevel: 0
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
    componentDidUpdate() {
        this._createPreviewTrack();
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
        const audioMeterFill = {
            width: `${Math.floor(this.state.audioLevel * 100)}%`
        };

        return (
            <div className = 'mic-preview' >
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
        this._destroyPreviewTrack();

        const description = this.props.devices.find(device =>
            device.label === this.props.label);

        if (!description) {
            return;
        }

        avUtils.createLocalAudioTrack(description.deviceId)
            .then(jitsiLocalTrack => {
                this._previewTrack = jitsiLocalTrack;

                this._previewTrack.on(
                    avUtils.getTrackEvents().TRACK_AUDIO_LEVEL_CHANGED,
                    this._updateAudioLevel
                );
            });
    }

    /**
     * Cleans up the audio track used for previewing.
     *
     * @private
     * @returns {void}
     */
    _destroyPreviewTrack() {
        if (this._previewTrack) {
            this._previewTrack.off(
                avUtils.getTrackEvents().TRACK_AUDIO_LEVEL_CHANGED,
                this._updateAudioLevel
            );
            this._previewTrack.dispose();
            this._previewTrack = null;
        }
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
