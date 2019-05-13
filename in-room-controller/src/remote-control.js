import PropTypes from 'prop-types';
import React from 'react';
import {
    StyleSheet,
    View
} from 'react-native';
import { WebView } from 'react-native-webview';

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

                    // The default is true but being explicit to point out
                    // scrolling is necessary for iOS (starting on 12.2) to
                    // properly center focus on inputs.
                    scrollEnabled = { true }

                    // In general the WebView should not need to scroll.
                    showsHorizontalScrollIndicator = { false }
                    showsVerticalScrollIndicator = { false }

                    source = {{ uri: this.props.url }} />
            </View>
        );
    }
}
