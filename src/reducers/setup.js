const DEFAULT_STATE = {
    completed: false,
    loadCompleted: false
};

export const SETUP_COMPLETED = 'SETUP_COMPLETED';
export const LOAD_COMPLETED = 'LOAD_COMPLETED';

/**
 * A {@code Reducer} to update the current Redux state for the 'setup' feature.
 * The 'setup' feature tracks whether the application has been initialized and
 * configured.
 *
 * @param {Object} state - The current Redux state for the 'setup' feature.
 * @param {Object} action - The Redux state update payload.
 */
const setup = (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case SETUP_COMPLETED:
        return {
            ...state,
            completed: true
        };

    case LOAD_COMPLETED:
        return {
            ...state,
            loadCompleted: true
        };

    default:
        return state;
    }
};

/**
 * A selector which returns whether or not the application has completed loading
 * external resources and processes.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isLoadComplete(state) {
    return state.setup.loadCompleted;
}

/**
 * A selector which returns whether or not the application has been configured.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isSetupComplete(state) {
    return state.setup.completed;
}

export default setup;
