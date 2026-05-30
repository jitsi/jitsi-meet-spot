/**
 * A selector which returns the locally configured name to use for the Spot-TV
 * to be displayed while in a meeting.
 *
 * @param state - The Redux state.
 * @returns {boolean}
 */
export function getDisplayName(state: any) {
    return state.setup.displayName;
}

/**
 * Returns the JWT for authentication with backend services.
 *
 * @param state - The Redux state.
 * @returns {string}
 */
export function getJwt(state: any) {
    return state.setup.jwt;
}

/**
 * A selector which returns the label for the camera device that should be
 * attempted to be used when starting a call.
 *
 * @param state - The Redux state.
 * @returns {string}
 */
export function getPreferredCamera(state: any) {
    return state.setup.preferredCamera;
}

/**
 * A selector which returns the resolution that should be
 * used to compute video constraints.
 *
 * @param state - The Redux state.
 * @returns {string}
 */
export function getPreferredResolution(state: any) {
    return state.setup.preferredResolution;
}

/**
 * A selector which returns the label for the microphone device that should be
 * attempted to be used when starting a call.
 *
 * @param state - The Redux state.
 * @returns {string}
 */
export function getPreferredMic(state: any) {
    return state.setup.preferredMic;
}

/**
 * A selector which returns the label for the speaker device that should be
 * attempted to be used when starting a call.
 *
 * @param state - The Redux state.
 * @returns {string}
 */
export function getPreferredSpeaker(state: any) {
    return state.setup.preferredSpeaker;
}

/**
 * Returns the params the app was started with.
 *
 * @param state - The Redux state.
 * @returns {Object}
 */
export function getStartParams(state: any) {
    return state.setup.startParams || {};
}

/**
 * Returns the tenant name stored in the Redux state.
 *
 * @param state - The Redux store.
 * @returns {?string}
 */
export function getTenant(state: any) {
    return state.setup.tenant;
}

/**
 * Returns whether or not any permanent Spot Remote is currently connected.
 *
 * @param state - The Redux store.
 * @returns {boolean}
 */
export function isPermanentRemotePaired(state: any) {
    return state.setup.isPermanentRemotePaired;
}

/**
 * A selector which returns whether or not the application has been configured.
 *
 * @param state - The Redux state.
 * @returns {boolean}
 */
export function isSetupComplete(state: any) {
    return state.setup.completed;
}

/**
* A selector which returns whether or not the current client is a Spot
* instance.
*
* @param state - The Redux state.
* @returns {boolean}
*/
export function isSpot(state: any) {
    return state.setup.isSpot;
}
