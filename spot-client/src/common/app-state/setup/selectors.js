/**
 * A selector which returns the configured url to use for the Spot-TV avatar
 * which should be displayed in meetings.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function getAvatarUrl(state) {
    return state.setup.avatarUrl;
}

/**
 * A selector which returns the configured name to use for the Spot-TV to be
 * displayed while in a meeting.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function getDisplayName(state) {
    return state.setup.displayName;
}

/**
 * Returns the JWT for authentication with backend services.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getJwt(state) {
    return state.setup.jwt;
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

/**
 * A selector which returns the label for the camera device that should be
 * attempted to be used when starting a call.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getPreferredCamera(state) {
    return state.setup.preferredCamera;
}

/**
 * A selector which returns the label for the microphone device that should be
 * attempted to be used when starting a call.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getPreferredMic(state) {
    return state.setup.preferredMic;
}

/**
 * A selector which returns the label for the speaker device that should be
 * attempted to be used when starting a call.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getPreferredSpeaker(state) {
    return state.setup.preferredSpeaker;
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
