/**
 * Is it ok to do the update.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isOkToUpdate(state: any): boolean {
    return state['common/auto-update'].okToUpdate;
}

/**
 * Is it the time for a nightly reload.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isTimeForNightlyReload(state: any): boolean {
    return state['common/auto-update'].isNightlyReloadTime;
}

/**
 * Checks if an update for the web source(spot-client) is available.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isWebUpdateAvailable(state: any): boolean {
    return state['common/auto-update'].webUpdateAvailable;
}

/**
 * Retrieves the last load time of the web client source.
 *
 * @param state - The Redux state.
 * @private
 * @returns
 */
export function _getLastLoadTime(state: any): Date {
    return state['common/auto-update']._lastLoadTime;
}
