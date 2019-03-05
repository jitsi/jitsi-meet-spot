import PropTypes from 'prop-types';
import React from 'react';

/**
 * Displays UI to play a sound, and does play the sound, from a selected
 * speaker.
 *
 * @extends React.PureComponent
 */
export default class SpeakerPreview extends React.PureComponent {
    static propTypes = {
        devices: PropTypes.array,
        label: PropTypes.string,
        src: PropTypes.string
    };

    /**
     * Initializes a new {@code SpeakerPreview} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._ref = React.createRef();

        this._onPreview = this._onPreview.bind(this);
    }

    /**
     * Updates the target speaker from which to play a preview sound.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._setAudioSink();
    }

    /**
     * Updates the target speaker from which to play a preview sound.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (prevProps.label !== this.props.label) {
            this._setAudioSink();
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <div>
                <a onClick = { this._onPreview }>Preview</a>
                <audio
                    ref = { this._ref }
                    src = { this.props.src } />
            </div>
        );
    }

    /**
     * Sets the target speaker on the audio preview.
     *
     * @private
     * @returns {void}
     */
    _setAudioSink() {
        const description = this.props.devices.find(device =>
            device.label === this.props.label);

        if (!description) {
            return;
        }

        this._ref.current.setSinkId(description.deviceId);
    }

    /**
     * Plays the audio preview from the target speaker.
     *
     * @private
     * @returns {void}
     */
    _onPreview() {
        this._ref.current.play();
    }
}
