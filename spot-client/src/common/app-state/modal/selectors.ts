import type { RootState } from '../types';

/**
 * A selector which returns the current modal, if any, which should be
 * displayed.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getCurrentModal(state: RootState): any {
    return {
        modal: state.modal.modal,
        modalProps: state.modal.modalProps
    };
}

/**
 * Returns true if any modal is open, false otherwise.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isAnyModalOpen(state: RootState): boolean {
    return Boolean(state.modal.modal);
}

/**
 * A selector which returns if the currently displayed modal, if any, matches
 * the provided component.
 *
 * @param state - The Redux state.
 * @param modal - The modal component to check if is displayed.
 * @returns
 */
export function isModalOpen(state: RootState, modal: any): boolean {
    return state.modal.modal === modal;
}
