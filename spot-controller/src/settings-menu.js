
import PropTypes from 'prop-types';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

const styles = StyleSheet.create({
    menu: {
        backgroundColor: 'gray',
        flex: 1,
        height: window.height,
        padding: 20,
        width: window.width
    }
});

/**
 * React Component for displaying a menu to interact with app state.
 *
 * @extends React.Component
 */
export default class SettingsMenu extends React.Component {
    static propTypes = {
        onClearRemoteUrl: PropTypes.func
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <ScrollView
                scrollsToTop = { false }
                style = { styles.menu }>
                <Text onPress = { this.props.onClearRemoteUrl }>
                    Reset URL
                </Text>
            </ScrollView>
        );
    }
}
