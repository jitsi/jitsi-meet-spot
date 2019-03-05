import PropTypes from 'prop-types';
import React from 'react';
import {
    StyleSheet,
    View
} from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * A view for showing the spot remote control page within a WebView.
 *
 * @extends React.Component
 */
export default class RemoteControl extends React.PureComponent {
    static propTypes = {
        url: PropTypes.string
    };

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
                    bounces = { false }
                    mediaPlaybackRequiresUserAction = { false }
                    scrollEnabled = { true }
                    source = {{ uri: this.props.url }}
                    style = {{
                        ...StyleSheet.absoluteFillObject
                    }} />
            </View>
        );
    }
}
