import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { CodeInput } from 'common/ui';

/**
 * Displays the setup step for Spot-TV to enter a code to create a connection
 * with a backend.
 *
 * @extends React.Component
 */
export class SyncWithBackend extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        onSuccess: PropTypes.func
    };

    /**
     * Initializes a new {@code SyncWithBackend} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onEntryComplete = this._onEntryComplete.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div className = 'setup-sync-with-backend'>
                <div className = 'cta'>
                    <div className = 'title'>
                        Welcome to Spot!
                    </div>
                    <div className = 'description'>
                        Enter your pairing code and start your setup
                    </div>
                </div>
                <div className = 'code-input'>
                    <CodeInput onEntryComplete = { this._onEntryComplete } />
                </div>
            </div>
        );
    }

    /**
     * Attempts validation of the entered code.
     *
     * @private
     * @returns {void}
     */
    _onEntryComplete() {
        this.props.onSuccess();
    }
}

export default connect()(SyncWithBackend);
