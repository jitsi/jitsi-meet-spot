import PropTypes from 'prop-types';
import React from 'react';
import {
    Button,
    StyleSheet,
    Text,
    View
} from 'react-native';
import KeepAwake from 'react-native-keep-awake';
import { WebView } from 'react-native-webview';

import LoadingScreen from './LoadingScreen';
import styles from './styles';

/**
 * A view for showing Spot-Remote within a WebView. A WebView is being used
 * until the needs of Spot-Remote cannot be satisfied with a WebView.
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

        this.state = {
            webViewError: null
        };

        this._onRetryWebViewLoad = this._onRetryWebViewLoad.bind(this);
        this._onWebViewLoadError = this._onWebViewLoadError.bind(this);
    }

    // Override the meta tag with values that are known not allow this app to
    // be native-app like but not break functionality like input centering.
    _preventWebViewZoomScript = `
        var metaTag = document.getElementsByName('viewport')[0];
        if (metaTag) {
            metaTag.setAttribute('content', 'initial-scale=1,user-scalable=no');
        }

        true;
    `;

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <View style = {{ ...StyleSheet.absoluteFillObject }}>
                <KeepAwake />
                {
                    this.state.webViewError
                        ? this._renderWebviewError()
                        : this._renderWebViewContent()
                }
            </View>
        );
    }

    /**
     * Clears any WebView error message to ensure the WebView attempts to load.
     *
     * @private
     * @returns {void}
     */
    _onRetryWebViewLoad() {
        this.setState({
            webViewError: null
        });
    }

    /**
     * Callback invoked when the WebView encounters and error while loading a
     * page.
     *
     * @param {Object} syntheticEvent - The error event from loading the url.
     * @private
     * @returns {void}
     */
    _onWebViewLoadError(syntheticEvent) {
        this.setState({
            webViewError: syntheticEvent.nativeEvent.description
        });
    }

    /**
     * Renders what should be shown in the place of the WebView.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderWebViewContent() {
        return (
            <WebView
                allowsInlineMediaPlayback = { true }
                allowsLinkPreview = { false }

                // Prevents moving the webview up and down.
                bounces = { false }

                // Do not cache so any reloads can pick up the latest.
                cacheEnabled = { false }

                directionalLockEnabled = { true }

                injectedJavaScript = { this._preventWebViewZoomScript }

                // Allow immediate playing of any media, like ultrasound.
                mediaPlaybackRequiresUserAction = { false }

                onError = { this._onWebViewLoadError }

                renderLoading = { this._renderLoading }

                // The default is true but being explicit to point out
                // scrolling is necessary for iOS (starting on 12.2) to
                // properly center focus on inputs.
                scrollEnabled = { true }

                // In general the WebView should not need to scroll.
                showsHorizontalScrollIndicator = { false }
                showsVerticalScrollIndicator = { false }

                source = {{ uri: this.props.url }}
                startInLoadingState = { true } />
        );
    }

    /**
     * Renders a page showing a loading indicator.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderLoading() {
        return <LoadingScreen />;
    }

    /**
     * Displays an error message for when the webview cannot load properly.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderWebviewError() {
        return (
            <View
                style = {{
                    ...styles.fullScreen,
                    ...styles.centeredContent
                }}>
                <Text style = { styles.headerText }>
                    We're sorry, but something went wrong.
                </Text>
                <Text style = { styles.infoText }>
                    Error detail: { this.state.webViewError }
                </Text>
                <Button
                    onPress = { this._onRetryWebViewLoad }
                    title = 'Retry' />
            </View>
        );
    }
}
