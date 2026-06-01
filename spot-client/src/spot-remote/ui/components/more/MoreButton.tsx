import type { RootState } from 'common/app-state';
import {
    hideModal,
    isModalOpen,
    showModal
} from 'common/app-state';
import { MoreVert } from 'common/icons';
import React, { useCallback } from 'react';
import { connect } from 'react-redux';


import { NavButton } from './../nav';
import MoreModal from './MoreModal';

interface IProps {
    isMoreModalOpen?: boolean;
    onHideModal?: () => void;
    onShowMoreModal?: () => void;
}

/**
 * A component for displaying and hiding the {@link MoreModal}.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function MoreButton({ isMoreModalOpen, onHideModal, onShowMoreModal }: IProps) {
    const onClick = useCallback(() => {
        if (isMoreModalOpen) {
            onHideModal?.();
        } else {
            onShowMoreModal?.();
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

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code MoreButton}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: RootState) {
    return {
        isMoreModalOpen: isModalOpen(state, MoreModal)
    };
}

/**
 * Creates actions which can update Redux state.
 *
 * @param dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch: any) {
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
