import PropTypes from 'prop-types';
import React from 'react';
import {
    NativeModules,
    StyleSheet,
    View,
    WebView
} from 'react-native';

const { Ultrasound } = NativeModules;

/**
 * A view for showing the spot remote control page within a WebView. Provides
 * a listener for message from the WebView to interact with native features.
 *
 * @extends React.Component
 */
export default class RemoteControl extends React.PureComponent {
    static propTypes = {
        url: PropTypes.string
    };

    /**
     * Initializes a new {@code RemoteControl} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._message = '';
        this._playUltrasoundInterval = null;

        this._onWebViewMessage = this._onWebViewMessage.bind(this);
        this._playUltrasound = this._playUltrasound.bind(this);
    }

    /**
     * Stops any ultrasound interval that may be running.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this._stopUltrasoundInterval();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <View style = {{ ...StyleSheet.absoluteFillObject }}>
                <WebView
                    bounces = { false }
                    mediaPlaybackRequiresUserAction = { false }
                    onMessage = { this._onWebViewMessage }
                    scalesPageToFit = { false }
                    scrollEnabled = { false }
                    source = {{ uri: this.props.url }}
                    style = {{
                        ...StyleSheet.absoluteFillObject
                    }} />
            </View>
        );
    }

    /**
     * Callback invoked when a message is sent from the WebView, through
     * postMessage, to the this component.
     *
     * @param {string} event - The message object as a string.
     * @param {string} event.type - The identifier for the topic of the message.
     * @param {Object} event.data - Additional information about the message.
     * @private
     * @returns {void}
     */
    _onWebViewMessage(event) {
        let data;

        try {
            data = JSON.parse(event.nativeEvent.data);
        } catch (e) {
            return;
        }

        switch (data.type) {
        case 'ultrasound-message-set': {
            this._message = (data.message || '').trim();

            if (this._message && !this._playUltrasoundInterval) {
                this._startUltrasoundInterval();
            } else if (!this._message) {
                this._stopUltrasoundInterval();
            }
        }
        }
    }

    /**
     * Emits the set message via ultrasound.
     *
     * @private
     * @returns {void}
     */
    _playUltrasound() {
        Ultrasound.play(this._message);
    }

    /**
     * Emits the set message and starts an interval to repeat sending every 5
     * seconds.
     *
     * @private
     * @returns {void}
     */
    _startUltrasoundInterval() {
        this._stopUltrasoundInterval();

        this._playUltrasound();

        this._playUltrasoundInterval
            = setInterval(this._playUltrasound, 5000);
    }

    /**
     * Clears any ultrasound interval that may be running.
     *
     * @private
     * @returns {void}
     */
    _stopUltrasoundInterval() {
        clearInterval(this._playUltrasoundInterval);

        this._playUltrasoundInterval = null;
    }
}