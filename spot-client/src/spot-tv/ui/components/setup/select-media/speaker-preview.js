import PropTypes from 'prop-types';
import React from 'react';

import { logger } from 'common/logger';

/**
 * Displays UI to play a sound, and actually play the sound, from a selected
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

        this.state = {
            hasSetSinkId: true
        };

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
    componentDidUpdate() {
        this._setAudioSink();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <div className = 'speaker-preview'>
                <a
                    className = {
                        `speaker-preview-link ${this.state.hasSetSinkId ? '' : 'disabled'}`
                    }
                    onClick = { this._onPreview }>
                    Play a test sound
                </a>
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
            this.setState({
                hasSetSinkId: false
            });

            return;
        }

        this._ref.current.setSinkId(description.deviceId)
            .then(() => {
                this.setState({
                    hasSetSinkId: true
                });
            })
            .catch(error => {
                logger.error('Speaker preview failed to set sink id', { error });

                this.setState({
                    hasSetSinkId: false
                });
            });
    }

    /**
     * Plays the audio preview from the target speaker.
     *
     * @private
     * @returns {void}
     */
    _onPreview() {
        if (this.state.hasSetSinkId) {
            this._ref.current.play();
        }
    }
}
