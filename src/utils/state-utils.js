import persistence from './persistence';

export function getPersistedState() {
    return persistence.get('spot') || {};
}

let cachedState;

function parsePersistedState(state) {
    return {
        calendars: {
            name: state.calendars.name
        },
        setup: {
            completed: state.setup.completed,
            apiKey: state.setup.apiKey,
            clientId: state.setup.clientId
        }
    };
}

function hasUpdateOfInterest(oldState, newState) {
    return oldState.calendars.name !== newState.calendars.name
        || oldState.setup.completed !== newState.setup.completed
        || oldState.setup.apiKey !== newState.setup.apiKey
        || oldState.setup.clientId !== newState.setup.clientId;
}

export function setPersistedState(store) {
    const newState = parsePersistedState(store.getState());

    // Check if cached state exists to intentionally skip the initial hydrating
    // of the redux store.
    if (cachedState && hasUpdateOfInterest(cachedState, newState)) {
        persistence.set('spot', newState);
    }

    cachedState = newState;
}
