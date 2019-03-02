import PropTypes from 'prop-types';
import React from 'react';

import { JitsiMeetJSProvider } from 'common/vendor';

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

        this._ref = React.createRef();
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
        if (prevProps.label !== this.props.label) {
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
            <video
                autoPlay = { true }
                ref = { this._ref } />
        );
    }

    /**
     * Creates the video track to use for displaying in the video element.
     *
     * @private
     * @returns {void}
     */
    _createPreviewTrack() {
        this._destroyPreviewTrack();

        const description = this.props.devices.find(device =>
            device.label === this.props.label);
        const JitsiMeetJS = JitsiMeetJSProvider.get();

        if (!description) {
            return;
        }

        JitsiMeetJS.createLocalTracks({
            cameraDeviceId: description.deviceId,
            devices: [ 'video' ]
        }).then(jitsiLocalTracks => {
            this._previewTrack = jitsiLocalTracks[0];

            this._ref.current.srcObject
                = this._previewTrack.getOriginalStream();
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
}
