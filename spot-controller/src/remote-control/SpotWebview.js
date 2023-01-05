import PropTypes from 'prop-types';
import React from 'react';
import {
    Button,
    NativeModules,
    StyleSheet,
    Text,
    View
} from 'react-native';
import KeepAwake from 'react-native-keep-awake';
import { WebView } from 'react-native-webview';
import url from 'url';

import api from '../api';
import { BeaconOverlay } from '../beacons';

import LoadingScreen from '../LoadingScreen';
import styles from '../styles';

const { AppInfo } = NativeModules;

/* global __DEV__ */

/**
 * The constant is included into the user agent part to allow feature detection in future.
 *
 * @type {string}
 */
const SPOT_CLIENT_FEATURE_VERSION = 'SpotController/1';

/**
 * A view for showing Spot-Remote within a WebView. A WebView is being used
 * until the needs of Spot-Remote cannot be satisfied with a WebView.
 */
export default class SpotRemoteWebView extends React.PureComponent {
    static propTypes = {
        url: PropTypes.string
    };

    /**
     * Initializes a new {@code SpotRemoteWebView} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            resolvedUrl: null,
            webViewError: null
        };

        this._onRetryWebViewLoad = this._onRetryWebViewLoad.bind(this);
        this._onWebViewLoadError = this._onWebViewLoadError.bind(this);
        this._setRef = this._setRef.bind(this);

        this._resolveUrl();

        this.userAgentString
            = __DEV__
                ? SPOT_CLIENT_FEATURE_VERSION
                : `${SPOT_CLIENT_FEATURE_VERSION} ${AppInfo.name}/${AppInfo.version}(${AppInfo.buildNumber})`;
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
     * Re-resolves the initial url if it has been updated.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (prevProps.url !== this.props.url) {
            this._resolveUrl();
        }
    }

    /**
     * Clears all local storage, which would generally be used to save app state.
     *
     * @returns {void}
     */
    clearStorage() {
        this._ref && this._ref.injectJavaScript(`
            localStorage.clear();
            true;
        `);
    }

    /**
     * Reloads the page.
     *
     * @returns {void}
     */
    reload() {
        this._ref && this._ref.reload();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        if (!this.state.resolvedUrl) {
            return this._renderLoading();
        }

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
        const { resolvedUrl } = this.state;
        const urlParts = url.parse(resolvedUrl);

        return (
            <View style = { styles.webView }>
                <WebView
                    allowsInlineMediaPlayback = { true }
                    allowsLinkPreview = { false }

                    applicationNameForUserAgent = { this.userAgentString }

                    // Prevents moving the webview up and down.
                    bounces = { false }

                    // Do not cache so any reloads can pick up the latest.
                    cacheEnabled = { false }

                    directionalLockEnabled = { true }

                    injectedJavaScript = { this._preventWebViewZoomScript }

                    // Allow immediate playing of any media.
                    mediaPlaybackRequiresUserAction = { false }

                    onError = { this._onWebViewLoadError }

                    onMessage = { api._onMessage }

                    /**
                     * Prevent any non-spot URLs from displaying in the webview,
                     * as there would be no navigation available to go back to
                     * spot. URLs which do not match the whitelist are handled
                     * by the device.
                     */
                    originWhitelist = { [ `*${urlParts.hostname}*` ] }

                    ref = { this._setRef }

                    renderLoading = { this._renderLoading }

                    // The default is true but being explicit to point out
                    // scrolling is necessary for iOS (starting on 12.2) to
                    // properly center focus on inputs.
                    scrollEnabled = { true }

                    // In general the WebView should not need to scroll.
                    showsHorizontalScrollIndicator = { false }
                    showsVerticalScrollIndicator = { false }

                    source = {{ uri: resolvedUrl }}
                    startInLoadingState = { true } />
                <BeaconOverlay />
            </View>
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

    /**
     * Resolve the initial URL, in case it was redirected.
     *
     * @returns {Promise}
     */
    async _resolveUrl() {
        let resolvedUrl = this.props.url;

        try {
            const response = await fetch(this.props.url, { method: 'HEAD' });

            if (response.ok) {
                // fetch() follows redirects, and the response will contain the
                // updated URL.
                resolvedUrl = response.url;
            }
        } catch (e) {
            // Hope everything goes ok with the supplied URL.
        }

        this.setState({
            resolvedUrl,
            webViewError: null
        });
    }

    /**
     * Updates the web view reference when it gets rendered.
     *
     * @param {ReactElement} ref - The web view reference.
     * @returns {void}
     */
    _setRef(ref) {
        this._ref = ref;

        api.setReference(ref);
    }
}
