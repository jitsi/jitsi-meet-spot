import React from 'react';

import { logger } from 'common/logger';
import { clearPersistedState } from 'common/utils';

import { Button } from './../button';

/**
 * Displays a menu option, with confirmation, to clear all saved Spot state,
 * including any spot-tv setup.
 *
 * @extends React.Component
 */
export default class ResetState extends React.Component {
    state = {
        resetting: false,
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
        let child;

        if (this.state.resetting) {
            child = 'Resetting';
        } else {
            child = this.state.showResetConfirm
                ? this._renderResetConfirm()
                : this._renderResetButton();
        }

        return (
            <div className = 'admin-content'>
                { child }
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
                <Button onClick = { this._onResetApp }>
                    Confirm
                </Button>
                <Button
                    appearance = 'secondary'
                    onClick = { this._onShowResetButton }>
                    Cancel
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
        logger.log('reset confirmed reset of application');

        this.setState({
            resetting: true
        }, () => {
            logger.log('reset clearing application state');

            clearPersistedState();

            setTimeout(() => {
                logger.log('reset reloading application');

                window.location.reload();
            }, 2000);
        });
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
