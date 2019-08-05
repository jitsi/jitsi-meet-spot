import PropTypes from 'prop-types';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

import { Icon } from '../icons';

const styles = StyleSheet.create({
    container: {
        marginBottom: 10
    },

    contents: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingLeft: 10,
        paddingRight: 10
    },

    text: {
        fontSize: 15,
        marginLeft: 15
    }
});

/**
 * Functional component for encapsulating the layout for a selectable option
 * in the settings menu.
 *
 * @param {Object} props - The read-only properties with which the new instance
 * is to be initialized.
 * @returns {ReactElement}
 */
export default function SettingsMenuButton(props) {
    return (
        <TouchableOpacity
            onPress = { props.onPress }
            style = { styles.container }>
            <View style = { styles.contents }>
                <Icon
                    color = { props.iconColor }
                    src = { props.icon } />
                <Text style = { styles.text }>{ props.text } </Text>
            </View>
        </TouchableOpacity>
    );
}

SettingsMenuButton.propTypes = {
    icon: PropTypes.func,
    iconColor: PropTypes.string,
    onPress: PropTypes.func,
    text: PropTypes.string
};
