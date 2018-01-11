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
            completed: state.setup.completed
        }
    };
}

function hasUpdateOfInterest(oldState, newState) {
    return oldState.calendars.name !== newState.calendars.name
        || oldState.setup.completed !== newState.setup.completed;
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
