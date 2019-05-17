import PropTypes from 'prop-types';
import React from 'react';

import { logger } from 'common/logger';
import { avUtils } from 'common/media';

/**
 * Displays a video element previewing the selected video input device.
 *
 * @extends React.PureComponent
 */
export default class CameraPreview extends React.PureComponent {
    static propTypes = {
        devices: PropTypes.array,
        label: PropTypes.string
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
                statusMessage: 'Preview Unavailable'
            });

            return;
        }

        const description = this.props.devices.find(device =>
            device.label === this.props.label);

        if (!description) {
            this._destroyPreviewTrack();

            this.setState({
                statusMessage: 'Preview Unavailable'
            });

            return;
        }

        if (this._previewTrack
            && this._previewTrack.getDeviceId() === description.deviceId) {
            return;
        }

        this._destroyPreviewTrack();

        const setLoadingPromise = new Promise(resolve => this.setState({
            statusMessage: 'loading'
        }, resolve));

        setLoadingPromise
            .then(() => avUtils.createLocalVideoTrack(description.deviceId))
            .then(jitsiLocalTrack => {
                if (jitsiLocalTrack.getDeviceId() !== description.deviceId) {
                    jitsiLocalTrack.dispose();

                    return Promise.reject('Wrong device id received');
                }

                this._previewTrack = jitsiLocalTrack;

                this._ref.current.srcObject
                    = this._previewTrack.getOriginalStream();
            })
            .catch(error => {
                logger.error('Camera preview failed', { error });

                this.setState({
                    statusMessage: 'Preview Unavailable'
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
            this._previewTrack.dispose();
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
