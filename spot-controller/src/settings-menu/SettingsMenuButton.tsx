import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { Icon } from '../icons';

interface SettingsMenuButtonProps {
    icon: React.FC<SvgProps>;
    iconColor?: string;
    onPress?: () => void;
    text?: string;
}

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
 * @param props - The read-only properties with which the new instance
 * is to be initialized.
 * @returns {ReactElement}
 */
export default function SettingsMenuButton(props: SettingsMenuButtonProps) {
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
