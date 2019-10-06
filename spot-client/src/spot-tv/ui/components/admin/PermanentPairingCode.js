import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { Button, LoadingIcon } from 'common/ui';

import { generateLongLivedPairingCodeIfExpired } from '../../../app-state';
import { getLongLivedPairingCodeInfo } from '../../../backend';

import AdminEntry from './admin-entry';

/**
 * Displays and refreshes the long lived code for Spot-Remotes to connect to
 * a Spot-TV.
 *
 * @extends React.Component
 */
export class PermanentPairingCode extends React.Component {
    static propTypes = {
        pairingCode: PropTypes.string,
        refreshPairingCode: PropTypes.func,
        t: PropTypes.func
    };

    /**
     * Initializes a new {@code PermanentPairingCode} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            stateToDisplay: 'button'
        };

        this._onShowCode = this._onShowCode.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        let content = null;

        if (this.state.stateToDisplay === 'loading') {
            content = <LoadingIcon />;
        } else if (this.state.stateToDisplay === 'code') {
            content = (
                <span className = 'pairing-code'>
                    { this.props.pairingCode }
                </span>
            );
        } else {
            content = (
                <Button onClick = { this._onShowCode }>
                    { this.props.t('admin.display') }
                </Button>
            );
        }

        return (
            <AdminEntry entryLabel = { this.props.t('admin.code') }>
                { content }
            </AdminEntry>
        );
    }

    /**
     * Callback invoked when the pairing code is to be revealed. Will call
     * to refresh the code.
     *
     * @private
     * @returns {void}
     */
    _onShowCode() {
        if (this.state.stateToDisplay !== 'button') {
            return;
        }

        const loadingPromise = new Promise(resolve => this.setState({
            stateToDisplay: 'loading'
        }, resolve));

        loadingPromise
            .then(() => this.props.refreshPairingCode())
            .then(() => this.setState({ stateToDisplay: 'code' }));
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code PermanentPairingCode}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    const pairingInfo = getLongLivedPairingCodeInfo(state);

    return {
        pairingCode: pairingInfo && pairingInfo.code
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
        refreshPairingCode() {
            return dispatch(generateLongLivedPairingCodeIfExpired());
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    withTranslation()(PermanentPairingCode)
);
