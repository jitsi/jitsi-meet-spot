import React from 'react';
import { persistence, windowHandler } from 'utils';

export default class ResetState extends React.Component {
    state = {
        showResetConfirm: false
    };

    constructor(props) {
        super(props);

        this._resetApp = this._resetApp.bind(this);
        this._showResetButton = this._showResetButton.bind(this);
        this._showResetConfirm = this._showResetConfirm.bind(this);
    }

    render() {
        return (
            <div>
                {
                    this.state.showResetConfirm
                        ? this._renderResetConfirm()
                        : this._renderResetButton()
                }
            </div>
        );
    }

    _renderResetButton() {
        return (
            <button onClick = { this._showResetConfirm }>
                Reset app
            </button>
        );
    }

    _renderResetConfirm() {
        return (
            <div>
                <div>Are you sure? The app will reload</div>
                <button onClick = { this._showResetButton }>
                    Cancel
                </button>
                <button onClick = { this._resetApp }>
                    Confirm
                </button>
            </div>
        );
    }

    _resetApp() {
        persistence.reset();
        windowHandler.reload();
    }

    _showResetButton() {
        this.setState({ showResetConfirm: false });
    }

    _showResetConfirm() {
        this.setState({ showResetConfirm: true });
    }
}
