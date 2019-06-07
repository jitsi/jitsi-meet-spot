import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { addNotification } from 'common/app-state';
import { CodeInput } from 'common/ui';
import { logger } from 'common/logger';

import { createSpotTVRemoteControlConnection } from '../../../app-state';

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

        this._onChange = this._onChange.bind(this);
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
                    <CodeInput onChange = { this._onChange } />
                </div>
            </div>
        );
    }

    /**
     * Attempts validation of the entered code.
     *
     * @param {string} value - The entered code.
     * @private
     * @returns {void}
     */
    _onChange(value) {
        if (value.length === 6) {
            this.props.dispatch(createSpotTVRemoteControlConnection({
                pairingCode: value,
                retry: false
            }))
                .then(
                    this.props.onSuccess,
                    error => {
                        logger.error('connectSpotTvToBackend failed', { error });
                        this.props.dispatch(addNotification('error', 'Something went wrong'));
                    });
        }
    }
}

export default connect()(SyncWithBackend);
