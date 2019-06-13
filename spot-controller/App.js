import AsyncStorage from '@react-native-community/async-storage';
import React from 'react';
import SideMenu from 'react-native-side-menu';

import RemoteControl from './src/remote-control';
import SettingsMenu from './src/settings-menu';
import Setup from './src/setup';

// FIXME make it possible to configure default URL on the build time
const DEFAULT_URL = 'https://spot.8x8.vc';

/**
 * The entry point of the InRoomController application. Essentially acts as a
 * router and global state store.
 *
 * @extends React.Component
 */
export default class App extends React.Component {
    /**
     * Initializes a new {@code App} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            remoteControlUrl: __DEV__ ? null : DEFAULT_URL
        };

        this._onClearRemoteUrl = this._onClearRemoteUrl.bind(this);
        this._onSubmitEnteredUrl = this._onSubmitEnteredUrl.bind(this);
    }

    /**
     * Fetches a previously saved remoteControlUrl and uses it, if available.
     *
     * @inheritdoc
     */
    componentDidMount() {
        if (__DEV__) {
            AsyncStorage.getItem('remote-control-url')
                .then(remoteControlUrl => {
                    this.setState({
                        remoteControlUrl: remoteControlUrl === null ? DEFAULT_URL : remoteControlUrl
                    });
                });
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { remoteControlUrl } = this.state;

        if (remoteControlUrl) {
            const remoteControlComponent = (
                <RemoteControl url = { `${remoteControlUrl}/?enableOnboarding=true` } />
            );

            // The side menu for editing the URL is enabled only in the debug mode.
            if (__DEV__) {
                return (
                    <SideMenu menu = { this._renderSettingsMenu() }>
                        { remoteControlComponent }
                    </SideMenu>
                );
            }

            return remoteControlComponent;
        }

        return <Setup onSubmitEnteredUrl = { this._onSubmitEnteredUrl } />;
    }

    /**
     * Clears the Spot-Remote url so it can be set again.
     *
     * @private
     * @returns {void}
     */
    _onClearRemoteUrl() {
        AsyncStorage.setItem(
            'remote-control-url',
            ''
        ).then(() => {
            this.setState({
                remoteControlUrl: ''
            });
        });
    }

    /**
     * Stores the Spot-Remote url so it can be displayed in
     * {@code RemoteControl}.
     *
     * @param {string} remoteControlUrl - The Spot-Remote url to display.
     * @returns {void}
     */
    _onSubmitEnteredUrl(remoteControlUrl) {
        AsyncStorage.setItem(
            'remote-control-url',
            remoteControlUrl
        );

        this.setState({
            remoteControlUrl
        });
    }

    /**
     * Returns a the React Component for the side menu contents.
     *
     * @private
     * @returns {ReactComponent}
     */
    _renderSettingsMenu() {
        return (
            <SettingsMenu onClearRemoteUrl = { this._onClearRemoteUrl } />
        );
    }
}
