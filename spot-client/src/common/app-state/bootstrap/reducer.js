import { BOOTSTRAP_COMPLETE } from './action-types';

const DEFAULT_STATE = {
    complete: false
};

/**
 * A {@code Reducer} to update the current Redux state for the 'bootstrap'
 * feature which tracks if the initial loading of the application has completed.
 *
 * @param {Object} state - The current Redux state for the 'bootstrap' feature.
 * @param {Object} action - The Redux state update payload.
 * @returns {Object}
 */
export default function bootstrapReducer(state = DEFAULT_STATE, action) {
    switch (action.type) {
    case BOOTSTRAP_COMPLETE:
        return {
            ...state,
            complete: true
        };

    default:
        return state;
    }
}
