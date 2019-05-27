import { MODAL_HIDE, MODAL_SHOW } from './actionTypes';

/**
 * Display a given modal component.
 *
 * @param {Object} modal - The modal component to be displayed.
 * @param {Object} modalProps - Props to pass into the modal component.
 * @returns {Object}
 */
export function showModal(modal, modalProps = {}) {
    return {
        type: MODAL_SHOW,
        modal,
        modalProps
    };
}

/**
 * Stops showing the currently displayed modal.
 *
 * @returns {Object}
 */
export function hideModal() {
    return {
        type: MODAL_HIDE
    };
}
