import persistence from './persistence';

/**
 * A unique identifier to use for persistence so the persistence service can
 * easily differentiate data it is interested in.
 *
 * @private
 * @type {string}
 */
const STORE_PERSISTENCE_KEY = 'spot';

/**
 * The last state update processed. Used as a flag to differentiate initial
 * bootstrapping and subsequent updates.
 *
 * @private
 * @type {Object|null}
 */
let cachedState = null;

/**
 * Checks if the new state update should update the persisted state.
 *
 * @param {Object} oldState - The outdated state object.
 * @param {Object} newState - The new state object to be compared to the old
 * state object.
 * @private
 * @returns {boolean} True if the new state has a changed value that should
 * trigger a persistence update.
 */
function hasUpdateOfInterest(oldState, newState) {
    return oldState.calendars.name !== newState.calendars.name
        || oldState.calendars.displayName !== newState.calendars.displayName
        || oldState.setup.completed !== newState.setup.completed;
}

/**
 * Transforms the Redux state into the format expected for persisted storage.
 *
 * @param {Object} state - The state object from Redux.
 * @private
 * @returns {Object} A new state object formatted for persisted storage.
 */
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

/**
 * Returns the application state that has been stored in through the persistence
 * service.
 *
 * @returns {Object}
 */
export function getPersistedState() {
    return persistence.get(STORE_PERSISTENCE_KEY) || {};
}

/**
 * Updates the persisted application state if the new state has an updated value
 * that should trigger a persistence update.
 *
 * @param {Object} store - The Redux store.
 * @returns {void}
 */
export function setPersistedState(store) {
    const newState = parsePersistedState(store.getState());

    // Check if cached state exists to intentionally skip a save request being
    // triggered due to the initial hydrating of the redux store.
    if (cachedState && hasUpdateOfInterest(cachedState, newState)) {
        persistence.set(STORE_PERSISTENCE_KEY, newState);
    }

    cachedState = newState;
}
