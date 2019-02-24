const DEFAULT_STATE = {
    completed: false,
    isSpot: false,
    showMeetingToolbar: false
};

export const SETUP_COMPLETED = 'SETUP_COMPLETED';
export const SET_IS_SPOT = 'SET_IS_SPOT';
export const SET_SHOW_MEETING_TOOLBAR = 'SET_SHOW_MEETING_TOOLBAR';

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

    case SET_SHOW_MEETING_TOOLBAR:
        return {
            ...state,
            showMeetingToolbar: action.visible
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
 * A selector which returns the UI configuration for the Jitsi-Meet meeting.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function getMeetingOptions(state) {
    return {
        showMeetingToolbar: state.setup.showMeetingToolbar
    };
}

export default setup;
