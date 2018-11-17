import React from 'react';

import { Button } from 'features/button';
import { persistence, windowHandler } from 'utils';

import styles from './admin.css';

/**
 * Displays a menu option, with confirmation, to clear all local application
 * state.
 *
 * @extends React.Component
 */
export default class ResetState extends React.Component {
    state = {
        showResetConfirm: false
    };

    /**
     * Initializes a new {@code ResetState} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._resetApp = this._resetApp.bind(this);
        this._showResetButton = this._showResetButton.bind(this);
        this._showResetConfirm = this._showResetConfirm.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <div className = { styles.container }>
                <div className = { styles.title }>
                    Reset
                </div>
                <div className = { styles.content }>
                    {
                        this.state.showResetConfirm
                            ? this._renderResetConfirm()
                            : this._renderResetButton()
                    }
                </div>
            </div>
        );
    }

    /**
     * Creates a new React Element which starts the application state reset
     * flow.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderResetButton() {
        return (
            <Button onClick = { this._showResetConfirm }>
                Reset app
            </Button>
        );
    }

    /**
     * Creates a new React Element asking for confirmation before application
     * state reset and shows a button to complete the reset.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderResetConfirm() {
        return (
            <div>
                <div>Are you sure? The app will reload</div>
                <Button onClick = { this._showResetButton }>
                    Cancel
                </Button>
                <Button onClick = { this._resetApp }>
                    Confirm
                </Button>
            </div>
        );
    }

    /**
     * Clears saved application state.
     *
     * @private
     * @returns {void}
     */
    _resetApp() {
        persistence.reset();
        windowHandler.reload();
    }

    /**
     * Sets the internal state to display the UI to start the application reset
     * flow.
     *
     * @private
     * @returns {void}
     */
    _showResetButton() {
        this.setState({ showResetConfirm: false });
    }

    /**
     * Sets the internal state to display the UI to execute the application
     * reset flow.
     *
     * @private
     * @returns {void}
     */
    _showResetConfirm() {
        this.setState({ showResetConfirm: true });
    }
}
