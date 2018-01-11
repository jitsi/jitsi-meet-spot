const DEFAULT_STATE = {
    completed: false,
    loadCompleted: false
};

export const SETUP_COMPLETED = 'SETUP_COMPLETED';
export const LOAD_COMPLETED = 'LOAD_COMPLETED';

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

export function isLoadComplete(state) {
    return state.setup.loadCompleted;
}

export function isSetupComplete(state) {
    return state.setup.completed;
}

export default setup;
