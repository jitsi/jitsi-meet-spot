const defaultState = {
    completed: false
};

const setup = (state = defaultState, action) => {
    switch (action.type) {
    case 'SETUP_COMPLETED':
        return {
            ...state,
            completed: true
        };
    case 'LOAD_COMPLETED':
        return {
            ...state,
            loadCompleted: true
        };

    case 'SET_GOOGLE_CLIENT':
        return {
            ...state
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
