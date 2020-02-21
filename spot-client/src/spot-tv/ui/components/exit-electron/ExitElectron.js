import React from 'react';

import { Cancel } from 'common/icons';

import { nativeCommands } from '../../../native-functions';

import ExitVerification from './ExitVerification';

/**
 * Provides UI for exiting the electron application, which normally may not be
 * exit-able due to kiosk mode.
 */
export default class ExitElectron extends React.Component {
    /**
     * Initializes a new {@code ExitElectron} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            showExitVerification: false
        };

        this._onHideOverlay = this._onHideOverlay.bind(this);
        this._onShowCloseOverlay = this._onShowCloseOverlay.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        if (this.state.showExitVerification) {
            return (
                <ExitVerification
                    onCancel = { this._onHideOverlay }
                    onVerification = { this._onExit } />
            );
        }

        return (
            <a
                className = 'close-electron-button'
                onClick = { this._onShowCloseOverlay }>
                <Cancel />
            </a>
        );
    }


    /**
     * Instructs the electron app to exit.
     *
     * @returns {void}
     */
    _onExit() {
        nativeCommands.sendExitApp();
    }

    /**
     * Hides the component asking to confirm application exit.
     *
     * @private
     * @returns {void}
     */
    _onHideOverlay() {
        this.setState({ showExitVerification: false });
    }

    /**
     * Displays the component asking for confirmation of application exit.
     *
     * @private
     * @returns {void}
     */
    _onShowCloseOverlay() {
        this.setState({ showExitVerification: true });
    }
}
