import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { hideModal, isModalOpen, showModal } from 'common/app-state';
import { Settings } from 'common/icons';

import AdminModal from './admin';

/**
 * A cog that controls displays of the admin settings.
 */
class SettingsButton extends React.Component {
    static propTypes = {
        isAdminModalOpen: PropTypes.bool,
        onChangeModalDisplay: PropTypes.func
    };

    /**
     * Initializes a new {@code SettingsButton} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onToggleAdminModal = this._onToggleAdminModal.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <a
                className = 'cog'
                data-qa-id = 'admin-settings'
                onClick = { this._onToggleAdminModal }>
                <Settings />
            </a>
        );
    }

    /**
     * Callback invoked to toggle the display of the {@code AdminModal}.
     *
     * @private
     * @returns {void}
     */
    _onToggleAdminModal() {
        this.props.onChangeModalDisplay(!this.props.isAdminModalOpen);
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code SettingsButton}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        isAdminModalOpen: isModalOpen(state, AdminModal)
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
         * Displays or hides the {@code AdminModal}.
         *
         * @param {boolean} shouldShow - Whether the AdminModal should be
         * displayed or hidden.
         * @returns {void}
         */
        onChangeModalDisplay(shouldShow) {
            dispatch(shouldShow ? showModal(AdminModal) : hideModal());
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsButton);
