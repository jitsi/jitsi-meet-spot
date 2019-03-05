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

    _preventWebViewZoomScript = `
        var metaTag = document.getElementsByName('viewport')[0];
        if (metaTag) {
            var content = metaTag.getAttribute('content') || '';
            var preventZoom = 'maximum-scale=1.0';
            if (!content.includes(preventZoom))
            metaTag.setAttribute(
                'content', content + ',' + preventZoom);
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
                    bounces = { false }
                    injectedJavaScript = { this._preventWebViewZoomScript }
                    mediaPlaybackRequiresUserAction = { false }
                    scrollEnabled = { false }
                    showsHorizontalScrollIndicator = { false }
                    showsVerticalScrollIndicator = { false }
                    source = {{ uri: this.props.url }}
                    style = {{
                        ...StyleSheet.absoluteFillObject
                    }} />
            </View>
        );
    }
}
