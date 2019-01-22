const DEFAULT_STATE = {
    completed: false,
    isSpot: false
};

export const SETUP_COMPLETED = 'SETUP_COMPLETED';
export const SETUP_SET_SCREENSHARE_DEVICE = 'SETUP_SET_SCREENSHARE_DEVICE';
export const SET_IS_SPOT = 'SET_IS_SPOT';

/**
 * A {@code Reducer} to update the current Redux state for the 'setup' feature.
 * The 'setup' feature tracks whether Spot has been configured.
 *
 * @param {Object} state - The current Redux state for the 'setup' feature.
 * @param {Object} action - The Redux state update payload.
 * @returns {Object}
 */
const setup = (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case SETUP_COMPLETED:
        return {
            ...state,
            completed: true
        };

    case SET_IS_SPOT:
        return {
            ...state,
            isSpot: action.isSpot
        };

    case SETUP_SET_SCREENSHARE_DEVICE:
        return {
            ...state,
            screenshareDevice: action.label
        };

    default:
        return state;
    }
};

/**
 * A selector which returns whether or not the application has been configured.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isSetupComplete(state) {
    return state.setup.completed;
}

/**
 * A selector which returns whether or not the current client is a Spot
 * instance.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isSpot(state) {
    return state.setup.isSpot;
}

/**
 * A selector which returns the video input device to use when screensharing
 * through a physical connection.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getScreenshareDevice(state) {
    return state.setup.screenshareDevice;
}

export default setup;
