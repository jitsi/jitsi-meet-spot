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
