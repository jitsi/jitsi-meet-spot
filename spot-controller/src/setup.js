import PropTypes from 'prop-types';
import React from 'react';
import {
    StyleSheet,
    TextInput,
    View
} from 'react-native';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F5FCFF',
        flex: 1
    },
    input: {
        borderColor: 'gray',
        borderWidth: 1,
        flexDirection: 'row',
        height: 40
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
                <TextInput
                    autoCorrect = { false }
                    onChangeText = { this._onEnteredUrlChange }
                    onSubmitEditing = { this._onSubmitEnteredUrl }
                    style = { styles.input }
                    value = { this.state.enteredRemoteControlUrl } />
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
        this.props.onSubmitEnteredUrl(this.state.enteredRemoteControlUrl);
    }
}
