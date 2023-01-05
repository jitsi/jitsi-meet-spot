import { addNotification, getProductName, getStartParams } from 'common/app-state';
import { logger } from 'common/logger';
import { CodeInput, LoadingIcon } from 'common/ui';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';


import { pairWithBackend } from '../../../app-state';
import { nativeCommands } from '../../../native-functions';

/**
 * Displays the setup step for Spot-TV to enter a code to create a connection
 * with a backend.
 */
export class SyncWithBackend extends React.Component {
    static defaultProps = {
        codeLength: 8
    };

    static propTypes = {
        codeLength: PropTypes.number,
        llpc: PropTypes.string,
        onAttemptSync: PropTypes.func,
        onStartAutoSync: PropTypes.func,
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
            autoSyncing: Boolean(props.llpc),
            loading: false
        };

        this._onChange = this._onChange.bind(this);
    }

    /**
     * Implements {@code Component#componentDidMount}.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._tryAutoSync();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { codeLength, productName, t } = this.props;
        const { autoSyncing, loading } = this.state;

        if (autoSyncing) {
            return null;
        }

        return (
            <div className = 'setup-sync-with-backend'>
                <div className = 'cta'>
                    <div className = 'title'>
                        { t('welcome', { productName }) }
                    </div>
                    <div className = 'description'>
                        { t('setup.enterCode') }
                    </div>
                </div>
                <div className = { `code-input ${loading ? 'with-loading' : ''}` }>
                    <CodeInput
                        length = { codeLength }
                        onChange = { this._onChange } />
                    { loading && <LoadingIcon /> }
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
        if (value.length !== this.props.codeLength) {
            return;
        }

        this.setState({
            loading: true
        }, () => {
            this._sync(value);
        });
    }

    /**
     * Syncs with backend with the provided pairing code.
     *
     * @param {string} value - The pairing code to sync with.
     * @returns {void}
     */
    _sync(value) {
        this.props.onAttemptSync(value).then(
            this.props.onSuccess,
            error => {
                this.setState({
                    autoSyncing: false,
                    loading: false
                });

                logger.error('connectSpotTvToBackend failed', { error });
                this.props.onSyncError(error);
                nativeCommands.sendBackendSyncNeeded(true);
            }
        );
    }

    /**
     * Tries to perform an auto sync if a pairing code is provided on start.
     *
     * NOTE: llpc stands for Long Time Pairing Code (per backend terminology).
     *
     * @returns {void}
     */
    _tryAutoSync() {
        const { codeLength, llpc } = this.props;

        if (!llpc || llpc.length !== codeLength) {
            this.setState({
                autoSyncing: false
            });
            nativeCommands.sendBackendSyncNeeded(false);
        } else {
            this.props.onStartAutoSync();
            this._sync(llpc);
        }
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
        productName: getProductName(state),
        llpc: getStartParams(state).llpc
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

        onStartAutoSync() {
            dispatch(addNotification('message', 'setup.autoSyncing'));
        },

        onSyncError(error) {
            // In the wrong password case return back to join code entry.
            if (error === 'not-authorized') {
                dispatch(addNotification('error', 'appEvents.invalidShareKey'));
            } else {
                dispatch(addNotification('error', 'appEvents.genericError'));
            }
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    withTranslation()(SyncWithBackend)
);
