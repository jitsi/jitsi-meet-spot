import React from 'react';
import { persistence, windowHandler } from 'utils';

import { Button } from 'features/button';
import styles from './admin.css';

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

    _renderResetButton() {
        return (
            <Button onClick = { this._showResetConfirm }>
                Reset app
            </Button>
        );
    }

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
