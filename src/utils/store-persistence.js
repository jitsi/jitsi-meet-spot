import persistence from './persistence';

const STORE_PERSISTENCE_KEY = 'spot';
let cachedState;

function hasUpdateOfInterest(oldState, newState) {
    return oldState.calendars.name !== newState.calendars.name
        || oldState.calendars.displayName !== newState.calendars.displayName
        || oldState.setup.completed !== newState.setup.completed;
}

function parsePersistedState(state) {
    return {
        calendars: {
            name: state.calendars.name,
            displayName: state.calendars.displayName
        },
        setup: {
            completed: state.setup.completed
        }
    };
}

export function getPersistedState() {
    return persistence.get(STORE_PERSISTENCE_KEY) || {};
}

export function setPersistedState(store) {
    const newState = parsePersistedState(store.getState());

    // Check if cached state exists to intentionally skip a save request being
    // triggered dueo to the initial hydrating of the redux store.
    if (cachedState && hasUpdateOfInterest(cachedState, newState)) {
        persistence.set(STORE_PERSISTENCE_KEY, newState);
    }

    cachedState = newState;
}
