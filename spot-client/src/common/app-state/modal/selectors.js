/**
 * A selector which returns the current modal, if any, which should be
 * displayed.
 *
 * @param {Object} state - The Redux state.
 * @returns {Object}
 */
export function getCurrentModal(state) {
    return {
        modal: state.modal.modal,
        modalProps: state.modal.modalProps
    };
}

/**
 * A selector which returns if the currently displayed modal, if any, matches
 * the provided component.
 *
 * @param {Object} state - The Redux state.
 * @param {Object} modal - The modal component to check if is displayed.
 * @returns {boolean}
 */
export function isModalOpen(state, modal) {
    return state.modal.modal === modal;
}
