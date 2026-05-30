import { logger } from 'common/logger';
import React from 'react';
import { withTranslation } from 'react-i18next';


/**
 * The type of the React {@code Component} props of {@link SpeakerPreview}.
 */
interface IProps {
    devices?: any[];
    label?: string;
    src?: string;
    t: (key: string) => string;
}

/**
 * The type of the React {@code Component} state of {@link SpeakerPreview}.
 */
interface IState {
    hasSetSinkId: boolean;
}

/**
 * Displays UI to play a sound, and actually play the sound, from a selected
 * speaker.
 */
export class SpeakerPreview extends React.PureComponent<IProps, IState> {
    _ref: React.RefObject<any>;

    /**
     * Initializes a new {@code SpeakerPreview} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
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
                    { this.props.t('setup.audioOutTest') }
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
        const description = this.props.devices?.find(device =>
            device.label === this.props.label);

        if (!description) {
            this.setState({
                hasSetSinkId: false
            });

            return;
        }

        this._ref.current?.setSinkId(description.deviceId)
            .then(() => {
                this.setState({
                    hasSetSinkId: true
                });
            })
            .catch((error: any) => {
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
            this._ref.current?.play();
        }
    }
}

export default withTranslation()(SpeakerPreview);
