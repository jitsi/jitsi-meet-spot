import AsyncStorage from '@react-native-community/async-storage';
import { MiddlewareRegistry, ReducerRegistry } from 'jitsi-meet-redux';
import React from 'react';
import SideMenu from 'react-native-side-menu';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import LoadingScreen from './src/LoadingScreen';
import { appMounted, appWillUnmount } from './src/app';
import RemoteControl from './src/remote-control';
import { SettingsMenu } from './src/settings-menu';
import Setup from './src/setup';

// Modules that doesn't necesarily export anything, but must be imported to function
import './src/beacons';
import './src/notifications';

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
            includeResetInUrl: false,
            loading: true,
            remoteControlUrl: null,
            showSetup: false,

            /**
             * A key is used on the webview so changing it can cause the webview
             * to re-render, which causes a reload back to the base url.
             */
            webViewKey: 0
        };

        this._sideMenuRef = React.createRef();
        this.store = createStore(ReducerRegistry.combineReducers(), {}, MiddlewareRegistry.applyMiddleware());

        this._onHideSetup = this._onHideSetup.bind(this);
        this._onResetApp = this._onResetApp.bind(this);
        this._onShowSetup = this._onShowSetup.bind(this);
        this._onSubmitEnteredUrl = this._onSubmitEnteredUrl.bind(this);
    }

    /**
     * Implements {@code Component#componentDidMount}.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this.store.dispatch(appMounted());

        AsyncStorage.getItem('remote-control-url')
            .then(remoteControlUrl => {
                this.setState({
                    loading: false,
                    remoteControlUrl: remoteControlUrl === null ? DEFAULT_URL : remoteControlUrl
                });
            });
    }

    /**
     * Implements {@code Component#componentWillUnmount}.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this.store.dispatch(appWillUnmount());
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        if (this.state.loading) {
            return <LoadingScreen />;
        }

        return (
            <Provider store = { this.store }>
                { this._renderRemoteControl() }
                { this.state.showSetup && this._renderSetup() }
            </Provider>
        );
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
        ).then(() => {
            this.setState({
                includeResetInUrl: false,
                showSetup: false,
                remoteControlUrl
            });
        });
    }

    /**
     * Returns a the React Component for the remote control.
     *
     * @private
     * @returns {ReactComponent}
     */
    _renderRemoteControl() {
        const { includeResetInUrl, remoteControlUrl } = this.state;

        return (
            <SideMenu
                menu = { this._renderSettingsMenu() }
                openMenuOffset = { 250 }
                ref = { this._sideMenuRef }>
                <RemoteControl
                    key = { this.state.webViewKey }
                    url = { `${remoteControlUrl}/?enableOnboarding=true&reset=${includeResetInUrl}` } />
            </SideMenu>
        );
    }

    /**
     * Returns a the React Component for the side menu contents.
     *
     * @private
     * @returns {ReactComponent}
     */
    _renderSettingsMenu() {
        return (
            <SettingsMenu
                onResetApp = { this._onResetApp }
                onShowSetup = { this._onShowSetup } />
        );
    }

    /**
     * Stops showing the dev setup screen.
     *
     * @returns {void}
     */
    _onHideSetup() {
        this.setState({
            showSetup: false
        });
    }

    /**
     * Triggers the webview component to reset back to its initial state.
     *
     * @private
     * @returns {void}
     */
    _onResetApp() {
        this._sideMenuRef.current.openMenu(false);
        this.setState({
            includeResetInUrl: true,
            webViewKey: this.state.webViewKey + 1
        });
    }

    /**
     * Shows the dev setup screen.
     *
     * @returns {void}
     */
    _onShowSetup() {
        this.setState({
            includeResetInUrl: false,
            showSetup: true
        });
    }

    /**
     * Returns a the React Component for the setup contents.
     *
     * @private
     * @returns {ReactComponent}
     */
    _renderSetup() {
        return (
            <Setup
                onCancel = { this._onHideSetup }
                onSubmitEnteredUrl = { this._onSubmitEnteredUrl } />
        );
    }
}
