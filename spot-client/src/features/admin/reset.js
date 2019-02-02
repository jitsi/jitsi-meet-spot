import React from 'react';

import { Button } from 'features/button';
import { persistence } from 'utils';

/**
 * Displays a menu option, with confirmation, to clear all saved Spot state,
 * including its setup.
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

        this._onResetApp = this._onResetApp.bind(this);
        this._onShowResetButton = this._onShowResetButton.bind(this);
        this._onShowResetConfirm = this._onShowResetConfirm.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <div className = 'admin-container'>
                <div className = 'admin-title'>
                    Reset
                </div>
                <div className = 'admin-content'>
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
     * Creates a new React Element which starts the Spot state reset
     * flow.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderResetButton() {
        return (
            <Button onClick = { this._onShowResetConfirm }>
                Reset app
            </Button>
        );
    }

    /**
     * Creates a new React Element asking for confirmation before resetting Spot
     * state and shows a button to complete the reset.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderResetConfirm() {
        return (
            <div>
                <div>Are you sure? The app will reload</div>
                <Button onClick = { this._onShowResetButton }>
                    Cancel
                </Button>
                <Button onClick = { this._onResetApp }>
                    Confirm
                </Button>
            </div>
        );
    }

    /**
     * Clears saved Spot state.
     *
     * @private
     * @returns {void}
     */
    _onResetApp() {
        persistence.reset();
        window.location.reload();
    }

    /**
     * Sets the internal state to display the UI to start the Spot reset flow.
     *
     * @private
     * @returns {void}
     */
    _onShowResetButton() {
        this.setState({ showResetConfirm: false });
    }

    /**
     * Sets the internal state to display the UI to execute the Spot reset flow.
     *
     * @private
     * @returns {void}
     */
    _onShowResetConfirm() {
        this.setState({ showResetConfirm: true });
    }
}
