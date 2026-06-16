import { logger } from 'common/logger';
import React from 'react';
import { withTranslation } from 'react-i18next';


import PreviewTrack from './PreviewTrack';

/**
 * The type of the props of {@link CameraPreview}.
 */
interface IProps {

    /**
     * The list of available media devices.
     */
    devices?: any[];

    /**
     * The label of the currently selected video input device.
     */
    label?: string;

    /**
     * The translation function.
     */
    t?: (key: string) => string;
}

/**
 * The type of the state of {@link CameraPreview}.
 */
interface IState {

    /**
     * A status message to display over the video preview.
     */
    statusMessage: string | null;
}

/**
 * Displays a video element previewing the selected video input device.
 */
export class CameraPreview extends React.PureComponent<IProps, IState> {
    _ref: React.RefObject<HTMLVideoElement | null>;
    _previewTrack: any;

    /**
     * Initializes a new {@code CameraPreview} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
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
    componentDidUpdate(prevProps: IProps) {
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
                statusMessage: this.props.t?.('setup.noPreview') ?? null
            });

            return;
        }

        const description = this.props.devices?.find(device =>
            device.label === this.props.label);

        if (!description) {
            this._destroyPreviewTrack();

            this.setState({
                statusMessage: this.props.t?.('setup.noPreview') ?? null
            });

            return;
        }

        if (this._previewTrack
            && this._previewTrack.isMatchindDeviceId(description.deviceId)) {
            return;
        }

        this._destroyPreviewTrack();

        const setLoadingPromise = new Promise<void>(resolve => this.setState({
            statusMessage: this.props.t?.('setup.loading') ?? null
        }, resolve));

        setLoadingPromise
            .then(() => {
                const previewTrack = new PreviewTrack('video', description.deviceId);

                return previewTrack.createPreview();
            })
            .then((previewTrack: any) => {
                this._previewTrack = previewTrack;

                if (this._ref.current) {
                    this._ref.current.srcObject = previewTrack.getOriginalStream();
                }
            })
            .catch((error: any) => {
                logger.error('Camera preview failed', { error });

                this.setState({
                    statusMessage: this.props.t?.('setup.noPreview') ?? null
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
