
import PropTypes from 'prop-types';
import React from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
    button: {
        marginVertical: 5,
        padding: 13
    },
    menu: {
        backgroundColor: 'white',
        flex: 1,
        height: window.height,
        width: 250
    },
    title: {
        backgroundColor: '#17A0DB',
        color: 'white',
        fontSize: 25,
        padding: 20,
        textAlign: 'center'
    }
});

/**
 * React Component for displaying a menu to interact with app state.
 *
 * @extends React.Component
 */
export default class SettingsMenu extends React.Component {
    static propTypes = {
        onClearRemoteUrl: PropTypes.func,
        onResetApp: PropTypes.func
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
                <Text style = { styles.title }>
                    Settings
                </Text>
                {
                    __DEV__ && <View style = { styles.button }>
                        <Button
                            onPress = { this.props.onClearRemoteUrl }
                            title = 'Reset URL' />
                    </View>
                }
                <View style = { styles.button }>
                    <Button
                        onPress = { this.props.onResetApp }
                        title = 'Reset' />
                </View>
            </ScrollView>
        );
    }
}
