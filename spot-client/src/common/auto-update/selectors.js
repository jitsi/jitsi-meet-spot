/**
 * Is it ok to do the update.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isOkToUpdate(state) {
    return state['common/auto-update'].okToUpdate;
}

/**
 * Is it the time for a nightly reload.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isTimeForNightlyReload(state) {
    return state['common/auto-update'].isNightlyReloadTime;
}

/**
 * Checks if an update for the web source(spot-client) is available.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isWebUpdateAvailable(state) {
    return state['common/auto-update'].webUpdateAvailable;
}
