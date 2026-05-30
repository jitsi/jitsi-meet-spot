import { MODAL_HIDE, MODAL_SHOW } from './actionTypes';

/**
 * Display a given modal component.
 *
 * @param modal - The modal component to be displayed.
 * @param modalProps - Props to pass into the modal component.
 * @returns
 */
export function showModal(modal: any, modalProps: any = {}): any {
    return {
        type: MODAL_SHOW,
        modal,
        modalProps
    };
}

/**
 * Stops showing the currently displayed modal.
 *
 * @returns
 */
export function hideModal(): any {
    return {
        type: MODAL_HIDE
    };
}
