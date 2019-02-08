import PropTypes from 'prop-types';
import React from 'react';
import {
    NativeModules,
    StyleSheet,
    View,
    WebView
} from 'react-native';

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
                    bounces = { false }
                    mediaPlaybackRequiresUserAction = { false }
                    scalesPageToFit = { false }
                    scrollEnabled = { false }
                    source = {{ uri: this.props.url }}
                    style = {{
                        ...StyleSheet.absoluteFillObject
                    }} />
            </View>
        );
    }
}
