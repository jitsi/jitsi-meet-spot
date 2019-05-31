import { ROUTE_CHANGED } from '../route/actionTypes';

import { MODAL_HIDE, MODAL_SHOW } from './actionTypes';

const DEFAULT_STATE = {
    modal: null,
    modalProps: null
};

/**
 * A {@code Reducer} to update the current Redux state for the 'modal' feature,
 * which controls the display of a modal over all other UI.
 *
 * @param {Object} state - The current Redux state for the 'modal' feature.
 * @param {Object} action - The Redux state update payload.
 * @returns {Object} The new redux state for the feature 'modal'.
 */
const modal = (state = DEFAULT_STATE, action) => {
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
