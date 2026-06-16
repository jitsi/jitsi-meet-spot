import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Fragment } from 'react';
import { Drawer } from 'react-native-drawer-layout';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import LoadingScreen from './src/LoadingScreen';
import { logger } from './src/logger';
import { RemoteControl } from './src/remote-control';
import { SettingsMenu } from './src/settings-menu';
import Setup from './src/setup';

// FIXME make it possible to configure default URL on the build time
const DEFAULT_URL = 'https://spot.8x8.vc';

/**
 * The async storage key which holds the remote control URL.
 */
const STORAGE_KEY_RC_URL = 'remote-control-url';

/**
 * The type of the state of {@code App}.
 */
interface AppState {
    loading: boolean;
    menuOpen: boolean;
    remoteControlUrl: string | null;
    showSetup: boolean;
    includeResetInUrl?: boolean;
}

/**
 * The entry point of the InRoomController application. Essentially acts as a
 * router and global state store.
 */
export default class App extends React.Component<Record<string, never>, AppState> {
    private _remoteControlViewRef = React.createRef<RemoteControl>();

    /**
     * Initializes a new {@code App} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Record<string, never>) {
        super(props);

        this.state = {
            loading: true,
            menuOpen: false,
            remoteControlUrl: null,
            showSetup: false
        };

        this._onCloseMenu = this._onCloseMenu.bind(this);
        this._onHideSetup = this._onHideSetup.bind(this);
        this._onOpenMenu = this._onOpenMenu.bind(this);
        this._onResetApp = this._onResetApp.bind(this);
        this._onShowSetup = this._onShowSetup.bind(this);
        this._onSubmitEnteredUrl = this._onSubmitEnteredUrl.bind(this);
        this._renderSettingsMenu = this._renderSettingsMenu.bind(this);
    }

    /**
     * Implements {@code Component#componentDidMount}.
     *
     * @inheritdoc
     */
    componentDidMount() {
        AsyncStorage.getItem(STORAGE_KEY_RC_URL)
            .then(remoteControlUrl => {
                this.setState({
                    loading: false,
                    remoteControlUrl: remoteControlUrl === null ? DEFAULT_URL : remoteControlUrl
                });
            });
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <GestureHandlerRootView style = {{ flex: 1 }}>
                {
                    this.state.loading
                        ? <LoadingScreen />
                        : (
                            <Fragment>
                                { this._renderRemoteControl() }
                                { this.state.showSetup && this._renderSetup() }
                            </Fragment>
                        )
                }
            </GestureHandlerRootView>
        );
    }

    /**
     * Stores the Spot-Remote url so it can be displayed in
     * {@code RemoteControl}.
     *
     * @param remoteControlUrl - The Spot-Remote url to display.
     * @returns {void}
     */
    _onSubmitEnteredUrl(remoteControlUrl: string) {
        AsyncStorage.setItem(
            STORAGE_KEY_RC_URL,
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
        const { remoteControlUrl } = this.state;

        return (
            <Drawer
                drawerStyle = {{ width: 250 }}
                onClose = { this._onCloseMenu }
                onOpen = { this._onOpenMenu }
                open = { this.state.menuOpen }
                renderDrawerContent = { this._renderSettingsMenu }>
                <RemoteControl
                    ref = { this._remoteControlViewRef }
                    url = { remoteControlUrl ?? DEFAULT_URL } />
            </Drawer>
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
     * Marks the settings side menu as closed (e.g. after a swipe-close gesture).
     *
     * @returns {void}
     */
    _onCloseMenu() {
        this.setState({ menuOpen: false });
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
     * Marks the settings side menu as open (e.g. after a swipe-open gesture).
     *
     * @returns {void}
     */
    _onOpenMenu() {
        this.setState({ menuOpen: true });
    }

    /**
     * Triggers the webview component to reset back to its initial state.
     *
     * @private
     * @returns {void}
     */
    _onResetApp() {
        this.setState({ menuOpen: false });

        this._remoteControlViewRef.current?.clearStorage();

        AsyncStorage.removeItem(STORAGE_KEY_RC_URL)
            .catch(error => {
                logger.error(
                    `Failed to remove ${STORAGE_KEY_RC_URL} from storage`,
                    error instanceof Error ? error.message : undefined);
            })
            .then(() => {
                // The purpose of doing a timeout is to give 'clearStorage' method some time to execute
                // the injected javascript.
                setTimeout(() => {
                    // Reload if the URL hasn't changed
                    if (this._remoteControlViewRef.current && this.state.remoteControlUrl === DEFAULT_URL) {
                        this._remoteControlViewRef.current.reload();
                    } else {
                        this.setState({
                            loading: false,
                            remoteControlUrl: DEFAULT_URL
                        });
                    }
                }, 1500);
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
