import PropTypes from 'prop-types';
import React from 'react';
import {
    Button,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import url from 'url';

import { logger } from './logger';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: 'black',
        flex: 1,
        paddingTop: '20%'
    },
    input: {
        backgroundColor: 'transparent',
        borderColor: 'white',
        borderRadius: 4,
        borderWidth: 1,
        color: 'white',
        fontSize: 23,
        height: 50,
        padding: 4,
        marginBottom: 30,
        textAlign: 'center',
        width: '75%'
    },
    title: {
        color: 'white',
        fontSize: 36,
        padding: 30,
        textAlign: 'center'
    }
});

/**
 * A view for entering the default Spot-Remote url to visit on application
 * launch.
 *
 * @extends React.Component
 */
export default class Setup extends React.Component {
    static propTypes = {
        onCancel: PropTypes.func,
        onSubmitEnteredUrl: PropTypes.func
    };

    /**
     * Initializes a new {@code Setup} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            enteredRemoteControlUrl: '',
            remoteControlUrl: ''
        };

        this._onEnteredUrlChange = this._onEnteredUrlChange.bind(this);
        this._onSubmitEnteredUrl = this._onSubmitEnteredUrl.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <View style = { styles.container }>
                <Text style = { styles.title }>
                    Please enter the URL for the Spot deployment
                </Text>
                <TextInput
                    autoCorrect = { false }
                    onChangeText = { this._onEnteredUrlChange }
                    onSubmitEditing = { this._onSubmitEnteredUrl }
                    placeholder = 'Spot URL'
                    placeholderTextColor = 'rgba(255, 255, 255, 0.3)'
                    style = { styles.input }
                    value = { this.state.enteredRemoteControlUrl } />
                <Button
                    color = 'white'
                    onPress = { this.props.onCancel }
                    title = 'Cancel' />
            </View>
        );
    }

    /**
     * Updates the known entered remote control url.
     *
     * @param {string} enteredRemoteControlUrl - The Spot-Remote url entered so
     * far.
     * @private
     * @returns {void}
     */
    _onEnteredUrlChange(enteredRemoteControlUrl) {
        this.setState({ enteredRemoteControlUrl });
    }

    /**
     * Callback invoked when a Spot-Remote url has been submitted for use.
     *
     * @private
     * @returns {void}
     */
    _onSubmitEnteredUrl() {
        try {
            const urlParts = url.parse(this.state.enteredRemoteControlUrl);

            if (/localhost|jitsi.net|8x8.vc/.exec(urlParts.hostname)) {
                this.props.onSubmitEnteredUrl(this.state.enteredRemoteControlUrl);
            }
        } catch (e) {
            logger.error(e);
        }
    }
}
