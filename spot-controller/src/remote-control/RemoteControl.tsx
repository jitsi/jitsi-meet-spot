import React from 'react';
import { AppState } from 'react-native';

import LoadingScreen from '../LoadingScreen';

import SpotWebview, { SpotWebviewProps } from './SpotWebview';

/**
 * The state of {@code RemoteControl}.
 */
interface RemoteControlState {
    active: boolean;
}

/**
 * Displays the Spot remote control and handles its lifecycle.
 */
export default class RemoteControl extends React.Component<SpotWebviewProps, RemoteControlState> {
    private _webViewRef = React.createRef<SpotWebview>();

    /**
     * Initializes a new {@code RemoteControl} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: SpotWebviewProps) {
        super(props);

        this.state = {
            active: AppState.currentState === 'active'
        };

        this._handleAppStateChange = this._handleAppStateChange.bind(this);
    }

    /**
     * Adds listeners for app background status.
     *
     * @inheritdoc
     */
    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
    }

    /**
     * Removes listeners for app background status.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    /**
     * Calls into the webview to reset its state.
     *
     * @returns {void}
     */
    clearStorage() {
        if (this.state.active) {
            this._webViewRef.current?.clearStorage();
        }
    }

    /**
     * Calls into the webview to reload the page.
     *
     * @returns {void}
     */
    reload() {
        if (this.state.active) {
            this._webViewRef.current?.reload();
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        if (!this.state.active) {
            return <LoadingScreen />;
        }

        return (
            <SpotWebview
                { ...this.props }
                ref = { this._webViewRef } />
        );
    }

    /**
     * Updates the known state of the app being in the background or not.
     *
     * @param nextAppState - The constant representing the current
     * background state of the application, as provided by React Native.
     * @returns {void}
     */
    _handleAppStateChange(nextAppState: string): void {
        this.setState({
            active: nextAppState === 'active'
        });
    }
}
