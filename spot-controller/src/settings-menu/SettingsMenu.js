
import PropTypes from 'prop-types';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text } from 'react-native';

import info from '../../assets/icons/info.svg';
import refresh from '../../assets/icons/refresh.svg';
import warning from '../../assets/icons/warning.svg';

import SettingsMenuButton from './SettingsMenuButton';

const styles = StyleSheet.create({
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
        marginBottom: 10,
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
                <SettingsMenuButton
                    icon = { refresh }
                    iconColor = 'black'
                    onPress = { this.props.onResetApp }
                    text = 'Reset' />
                <SettingsMenuButton
                    icon = { info }
                    iconColor = 'black'
                    onPress = { this._onOpenTermsAndConditions }
                    text = 'Terms' />
                <SettingsMenuButton
                    icon = { info }
                    iconColor = 'black'
                    onPress = { this._onOpenPrivacyPolicy }
                    text = 'Privacy' />
                {
                    __DEV__ && <SettingsMenuButton
                        icon = { warning }
                        iconColor = 'red'
                        onPress = { this.props.onClearRemoteUrl }
                        text = 'Reset URL' />
                }
            </ScrollView>
        );
    }

    /**
     * Callback invoked to open the privacy policy in the device browser.
     *
     * @private
     * @returns {void}
     */
    _onOpenPrivacyPolicy() {
        Linking.openURL('https://www.8x8.com/terms-and-conditions/privacy-policy');
    }

    /**
     * Callback invoked to open the terms and conditions in the device browser.
     *
     * @private
     * @returns {void}
     */
    _onOpenTermsAndConditions() {
        Linking.openURL('https://www.8x8.com/terms-and-conditions/8x8-end-user-terms-of-use');
    }
}
