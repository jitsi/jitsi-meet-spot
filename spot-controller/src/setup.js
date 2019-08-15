import PropTypes from 'prop-types';
import React from 'react';
import {
    Button,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

import { logger } from './logger';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: 'black',
        flex: 1,
        paddingTop: '20%'
    },
    error: {
        color: 'lightcoral',
        fontSize: 23,
        marginBottom: 20
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
            errorLoadingConfig: false,
            loading: false,
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
                {
                    this.state.errorLoadingConfig
                        ? <Text style = { styles.error }>An error occurred</Text>
                        : null
                }
                <TextInput
                    autoCorrect = { false }
                    editable = { !this.state.loading }
                    onChangeText = { this._onEnteredUrlChange }
                    onSubmitEditing = { this._onSubmitEnteredUrl }
                    placeholder = 'Spot URL'
                    placeholderTextColor = 'rgba(255, 255, 255, 0.3)'
                    style = { styles.input }
                    value = { this.state.enteredRemoteControlUrl } />
                <Button
                    color = 'white'
                    disabled = { this.state.loading }
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
        const setLoading = new Promise(resolve => {
            this.setState({
                errorLoadingConfig: false,
                loading: true
            }, resolve);
        });

        setLoading
            .then(() => fetch(`${this.state.enteredRemoteControlUrl}/dist/config/config.js`))
            .then(response => {
                if (response.status === 200) {
                    return response.responseText || response.text();
                }

                return Promise.reject(response.statusText);
            })
            .then(responseText => {
                if (responseText.includes('JitsiMeetSpotConfig')) {
                    return this.props.onSubmitEnteredUrl(this.state.enteredRemoteControlUrl);
                }

                return Promise.reject('no config found');
            })
            .catch(error => {
                logger.error(error);

                this.setState({
                    errorLoadingConfig: true,
                    loading: false
                });
            });
    }
}
