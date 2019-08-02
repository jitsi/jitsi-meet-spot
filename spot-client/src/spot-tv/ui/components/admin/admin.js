import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { hideModal } from 'common/app-state';
import { isBackendEnabled } from 'common/backend';
import { Modal } from 'common/ui';

import { SelectMedia } from '../setup';

import PermanentPairingCode from './PermanentPairingCode';
import PreferredDevices from './preferred-devices';
import ResetApp from './reset-app';
import SetupWizard from './setup-wizard';

/**
 * A component for providing post-setup Spot-TV configuration.
 *
 * @extends React.Component
 */
class AdminModal extends React.Component {
    static propTypes = {
        isBackendEnabled: PropTypes.bool,
        onClose: PropTypes.func
    };

    /**
     * Initializes a new {@code AdminView} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            view: 'all'
        };

        this._onChangeDevices = this._onChangeDevices.bind(this);
        this._onShowAllOptions = this._onShowAllOptions.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <Modal
                onClose = { this.props.onClose } >
                <div className = 'translucent-modal'>
                    { this._renderSubcomponent() }
                </div>
            </Modal>
        );
    }

    /**
     * Returns the contents of the view that should be displayed.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderSubcomponent() {
        switch (this.state.view) {
        case 'device-selection':
            return (
                <SelectMedia onSuccess = { this._onShowAllOptions } />
            );
        case 'all':
        default:
            return [
                this.props.isBackendEnabled
                    ? <PermanentPairingCode key = 'permanent-pairing-code' />
                    : null,
                <PreferredDevices
                    key = 'key=preferredDevices'
                    onClick = { this._onChangeDevices } />,
                this.props.isBackendEnabled
                    ? null
                    : <SetupWizard key = 'key-setupWizard' />,
                <ResetApp key = 'key-resetState' />
            ];
        }
    }

    /**
     * Displays the view for setting preferred audio and video devices for
     * conferencing.
     *
     * @private
     * @returns {void}
     */
    _onChangeDevices() {
        this.setState({ view: 'device-selection' });
    }

    /**
     * Displays the main admin view for a summary of the current Spot-TV
     * configuration.
     *
     * @private
     * @returns {void}
     */
    _onShowAllOptions() {
        this.setState({ view: 'all' });
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code AdminModal}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        isBackendEnabled: isBackendEnabled(state)
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
        /**
         * Stop showing the {@code AdminModal}.
         *
         * @returns {void}
         */
        onClose() {
            dispatch(hideModal());
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminModal);
