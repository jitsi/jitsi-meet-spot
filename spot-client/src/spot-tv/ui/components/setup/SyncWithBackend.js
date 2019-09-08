import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { addNotification, getProductName } from 'common/app-state';
import { CodeInput, LoadingIcon } from 'common/ui';
import { logger } from 'common/logger';

import { pairWithBackend } from '../../../app-state';

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
        onSyncError: PropTypes.func,
        productName: PropTypes.string,
        t: PropTypes.func
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
                        {
                            this.props.t('welcome', {
                                productName: this.props.productName
                            })
                        }
                    </div>
                    <div className = 'description'>
                        { this.props.t('setup.enterCode') }
                    </div>
                </div>
                <div className = { `code-input ${this.state.loading ? 'with-loading' : ''}` }>
                    <CodeInput
                        length = { 8 }
                        onChange = { this._onChange } />
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
        if (value.length !== 8) {
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
 * Selects parts of the Redux state to pass in with the props of
 * {@code SyncWithBackend}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        productName: getProductName(state)
    };
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
            return dispatch(pairWithBackend(pairingCode));
        },

        onSyncError() {
            dispatch(addNotification('error', 'notifications.genericWrong'));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    withTranslation()(SyncWithBackend)
);
