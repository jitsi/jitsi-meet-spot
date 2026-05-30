import { hideModal, isModalOpen, showModal } from 'common/app-state';
import { Settings } from 'common/icons';
import React, { useCallback } from 'react';
import { connect } from 'react-redux';


import AdminModal from './admin';

interface IProps {
    isAdminModalOpen?: boolean;
    onChangeModalDisplay?: (shouldShow: boolean) => void;
}

/**
 * A cog that controls displays of the admin settings.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
function SettingsButton(props: IProps) {
    const toggleAdminModal = useCallback(() => {
        props.onChangeModalDisplay?.(!props.isAdminModalOpen);
    }, [ props.isAdminModalOpen ]);

    return (
        <a
            className = 'cog admin-settings'
            data-qa-id = 'admin-settings'
            onClick = { toggleAdminModal }>
            <Settings />
        </a>
    );
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code SettingsButton}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: any) {
    return {
        isAdminModalOpen: isModalOpen(state, AdminModal)
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
         * Displays or hides the {@code AdminModal}.
         *
         * @param shouldShow - Whether the AdminModal should be
         * displayed or hidden.
         * @returns {void}
         */
        onChangeModalDisplay(shouldShow: boolean) {
            dispatch(shouldShow ? showModal(AdminModal) : hideModal());
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsButton);
