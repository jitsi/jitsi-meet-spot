import { logger } from 'common/logger';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';


import PreviewTrack from './PreviewTrack';

/**
 * Displays a video element previewing the selected video input device.
 */
export class CameraPreview extends React.PureComponent {
    static propTypes = {
        devices: PropTypes.array,
        label: PropTypes.string,
        t: PropTypes.func
    };

    /**
     * Initializes a new {@code CameraPreview} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            statusMessage: null
        };

        this._ref = React.createRef();

        this._onPreviewPlaying = this._onPreviewPlaying.bind(this);
    }

    /**
     * Begins displaying a video preview of any selected video input device.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._createPreviewTrack();
    }

    /**
     * Updates the video preview to display the selected video input device.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        // Prevent state updates from trigger re-creation of the preview track.
        if (this.props !== prevProps) {
            this._createPreviewTrack();
        }
    }

    /**
     * Cleans up the video track used for previewing.
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
        return (
            <div className = 'camera-preview'>
                <video
                    autoPlay = { true }
                    onPlaying = { this._onPreviewPlaying }
                    ref = { this._ref } />
                <div className = { `error-cover ${this.state.statusMessage ? 'visible' : ''}` }>
                    { this.state.statusMessage }
                </div>
            </div>
        );
    }

    /**
     * Creates the video track to use for displaying in the video element.
     *
     * @private
     * @returns {void}
     */
    _createPreviewTrack() {
        if (!this.props.label) {
            this._destroyPreviewTrack();

            this.setState({
                statusMessage: this.props.t('setup.noPreview')
            });

            return;
        }

        const description = this.props.devices.find(device =>
            device.label === this.props.label);

        if (!description) {
            this._destroyPreviewTrack();

            this.setState({
                statusMessage: this.props.t('setup.noPreview')
            });

            return;
        }

        if (this._previewTrack
            && this._previewTrack.isMatchindDeviceId(description.deviceId)) {
            return;
        }

        this._destroyPreviewTrack();

        const setLoadingPromise = new Promise(resolve => this.setState({
            statusMessage: this.props.t('setup.loading')
        }, resolve));

        setLoadingPromise
            .then(() => {
                const previewTrack = new PreviewTrack('video', description.deviceId);

                return previewTrack.createPreview();
            })
            .then(previewTrack => {
                this._previewTrack = previewTrack;

                this._ref.current.srcObject = previewTrack.getOriginalStream();
            })
            .catch(error => {
                logger.error('Camera preview failed', { error });

                this.setState({
                    statusMessage: this.props.t('setup.noPreview')
                });
            });
    }

    /**
     * Cleans up the video track used for previewing.
     *
     * @private
     * @returns {void}
     */
    _destroyPreviewTrack() {
        if (this._previewTrack) {
            this._previewTrack.destroy();
            this._previewTrack = null;
        }
    }

    /**
     * Callback invoked when the video preview begings to play video. Updates
     * state so the video can be visible.
     *
     * @private
     * @returns {void}
     */
    _onPreviewPlaying() {
        this.setState({
            statusMessage: null
        });
    }
}

export default withTranslation()(CameraPreview);
