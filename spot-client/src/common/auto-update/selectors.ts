import type { RootState } from 'common/app-state';

/**
 * Is it ok to do the update.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isOkToUpdate(state: RootState): boolean {
    return state['common/auto-update'].okToUpdate;
}

/**
 * Is it the time for a nightly reload.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isTimeForNightlyReload(state: RootState): boolean {
    return state['common/auto-update'].isNightlyReloadTime;
}

/**
 * Checks if an update for the web source(spot-client) is available.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isWebUpdateAvailable(state: RootState): boolean {
    return state['common/auto-update'].webUpdateAvailable;
}

/**
 * Retrieves the last load time of the web client source.
 *
 * @param state - The Redux state.
 * @private
 * @returns
 */
export function _getLastLoadTime(state: RootState): Date {
    return state['common/auto-update']._lastLoadTime;
}
