import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import {
    isModalOpen,
    showModal,
    hideModal
} from 'common/app-state';
import { MoreVert } from 'common/icons';

import { NavButton } from './../nav';

import MoreModal from './MoreModal';

/**
 * A component for displaying and hiding the {@link MoreModal}.
 *
 * @extends React.Component
 */
export class MoreButton extends React.Component {
    static propTypes = {
        isMoreModalOpen: PropTypes.bool,
        onHideModal: PropTypes.func,
        onShowMoreModal: PropTypes.func,
        t: PropTypes.func
    };

    /**
     * Initializes a new {@code MoreButton} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onToggleMoreModal = this._onToggleMoreModal.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const moreButtonStyles = this.props.isMoreModalOpen ? 'active' : '';

        return (
            <NavButton
                className = { moreButtonStyles }
                label = { this.props.t('commands.more') }
                onClick = { this._onToggleMoreModal }
                qaId = 'more'>
                <MoreVert />
            </NavButton>
        );
    }

    /**
     * Displays the {@code MoreModal} or hides the currently displayed modal.
     *
     * @private
     * @returns {void}
     */
    _onToggleMoreModal() {
        if (this.props.isMoreModalOpen) {
            this.props.onHideModal();
        } else {
            this.props.onShowMoreModal();
        }
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code MoreButton}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        isMoreModalOpen: isModalOpen(state, MoreModal)
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
         * Stop displaying all modals.
         *
         * @returns {void}
         */
        onHideModal() {
            dispatch(hideModal());
        },

        /**
         * Displays the {@code MoreModal} for additional in-meeting functions.
         *
         * @returns {void}
         */
        onShowMoreModal() {
            dispatch(showModal(MoreModal));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    withTranslation()(MoreButton)
);
