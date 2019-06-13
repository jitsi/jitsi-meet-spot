import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import styles from './styles';

/**
 * Renders a page showing a loading indicator.
 *
 * @returns {ReactElement}
 */
export default function LoadingScreen() {
    return (
        <View
            style = {{
                ...styles.fullScreen,
                ...styles.centeredContent
            }}>
            <ActivityIndicator size = 'large' />
        </View>
    );
}
