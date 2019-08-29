import { FEEDBACK_HIDE, FEEDBACK_SHOW } from './actionTypes';

const DEFAULT_STATE = {
    show: false
};

/**
 * A {@code Reducer} to update the current Redux state for the 'feedback'
 * feature. The 'feedback' feature stores whether or not the app feedback
 * entry overlay should be displayed.
 *
 * @param {Object} state - The current Redux state for the 'feedback' feature.
 * @param {Object} action - The Redux state update payload.
 * @returns {Object}
 */
const feedback = (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case FEEDBACK_HIDE:
        return {
            ...state,
            show: false
        };

    case FEEDBACK_SHOW:
        return {
            ...state,
            show: true
        };

    default:
        return state;
    }
};

export default feedback;
