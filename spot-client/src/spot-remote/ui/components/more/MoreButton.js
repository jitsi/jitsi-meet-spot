import {
    hideModal,
    isModalOpen,
    showModal
} from 'common/app-state';
import { MoreVert } from 'common/icons';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { connect } from 'react-redux';


import { NavButton } from './../nav';
import MoreModal from './MoreModal';

/**
 * A component for displaying and hiding the {@link MoreModal}.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function MoreButton({ isMoreModalOpen, onHideModal, onShowMoreModal }) {
    const onClick = useCallback(() => {
        if (isMoreModalOpen) {
            onHideModal();
        } else {
            onShowMoreModal();
        }
    }, [ isMoreModalOpen, onHideModal, onShowMoreModal ]);

    return (
        <NavButton
            onClick = { onClick }
            qaId = 'more'>
            <MoreVert />
        </NavButton>
    );
}

MoreButton.propTypes = {
    isMoreModalOpen: PropTypes.bool,
    onHideModal: PropTypes.func,
    onShowMoreModal: PropTypes.func
};

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

export default connect(mapStateToProps, mapDispatchToProps)(MoreButton);
