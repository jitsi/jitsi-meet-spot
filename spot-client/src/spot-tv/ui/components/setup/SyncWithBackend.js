import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { addNotification } from 'common/app-state';
import { CodeInput, LoadingIcon } from 'common/ui';
import { logger } from 'common/logger';

import {
    createSpotTVRemoteControlConnection,
    disconnectSpotTvRemoteControl,
    generateLongLivedPairingCode
} from '../../../app-state';

/**
 * Displays the setup step for Spot-TV to enter a code to create a connection
 * with a backend.
 *
 * @extends React.Component
 */
export class SyncWithBackend extends React.Component {
    static propTypes = {
        onAttemptSync: PropTypes.func,
        onSuccess: PropTypes.func,
        onSyncError: PropTypes.func
    };

    /**
     * Initializes a new {@code SyncWithBackend} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            loading: false
        };

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
                <div className = { `code-input ${this.state.loading ? 'with-loading' : ''}` }>
                    <CodeInput onChange = { this._onChange } />
                    { this.state.loading && <LoadingIcon /> }
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
        if (value.length !== 6) {
            return;
        }

        const setLoadingPromise = new Promise(resolve => {
            this.setState({
                loading: true
            }, resolve);
        });

        setLoadingPromise
            .then(() => this.props.onAttemptSync(value))
            .then(
                this.props.onSuccess,
                error => {
                    this.setState({
                        loading: false
                    });

                    logger.error('connectSpotTvToBackend failed', { error });
                    this.props.onSyncError();
                });
    }
}

/**
 * Creates actions which can update Redux state.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        onAttemptSync(pairingCode) {
            return dispatch(createSpotTVRemoteControlConnection({
                pairingCode,
                retry: false
            }))
            .then(
                () => dispatch(generateLongLivedPairingCode())
                    .catch(error => {

                        // This intentionally disconnects only on the generateLongLivedPairingCode failure, because
                        // it's not part of the connect promise and will not cause disconnect, causing the connection
                        // to be left behind.
                        logger.error('Failed to generate long lived pairing code', { error });
                        dispatch(disconnectSpotTvRemoteControl());

                        throw error;
                    })
            );
        },

        onSyncError() {
            dispatch(addNotification('error', 'Something went wrong'));
        }
    };
}

export default connect(undefined, mapDispatchToProps)(SyncWithBackend);
