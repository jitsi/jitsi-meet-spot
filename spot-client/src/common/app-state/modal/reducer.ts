import { ROUTE_CHANGED } from '../route/actionTypes';

import { MODAL_HIDE, MODAL_SHOW } from './actionTypes';

interface IModalState {
    modal: any;
    modalProps: any;
}

const DEFAULT_STATE: IModalState = {
    modal: null,
    modalProps: null
};

/**
 * A {@code Reducer} to update the current Redux state for the 'modal' feature,
 * which controls the display of a modal over all other UI.
 *
 * @param state - The current Redux state for the 'modal' feature.
 * @param action - The Redux state update payload.
 * @returns The new redux state for the feature 'modal'.
 */
const modal = (state: IModalState = DEFAULT_STATE, action: any): IModalState => {
    switch (action.type) {
    case MODAL_HIDE:
    case ROUTE_CHANGED:
        return DEFAULT_STATE;

    case MODAL_SHOW:
        return {
            modal: action.modal,
            modalProps: action.modalProps
        };

    default:
        return state;
    }
};

export default modal;
