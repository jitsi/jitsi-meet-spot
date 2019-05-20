import { StyleSheet } from 'react-native';

const BACKGROUND_COLOR = 'black';
const TEXT_COLOR = 'white';

export default {
    centeredContent: {
        alignItems: 'center',
        justifyContent: 'center'
    },

    fullScreen: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: BACKGROUND_COLOR
    },

    headerText: {
        color: TEXT_COLOR,
        fontSize: 20
    },

    infoText: {
        color: TEXT_COLOR
    }
};
