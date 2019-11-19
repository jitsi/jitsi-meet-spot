import { getSpotClientVersion } from 'common/app-state';
import { fetchSpotClientVersion } from 'common/backend';
import { logger } from '../logger';

import {
    SET_IS_NIGHTLY_RELOAD_TIME,
    SET_LAST_LOAD_TIME,
    SET_OK_TO_UPDATE,
    SET_WEB_UPDATE_AVAILABLE,
    UPDATE_WEB_SOURCE
} from './actionTypes';

/**
 * Checks if update for the web source is available.
 *
 * @returns {Function}
 */
export function checkForWebUpdateAvailable() {
    return (dispatch, getState) => fetchSpotClientVersion('./dist/spot-client-version.json').then(newVersion => {
        const currentVersion = getSpotClientVersion(getState());
        const isUpdateAvailable = Boolean(newVersion) && newVersion !== currentVersion;

        isUpdateAvailable && logger.debug(`Retrieved Spot client version: ${newVersion}`, {
            newVersion,
            currentVersion,
            isUpdateAvailable
        });

        dispatch(setWebUpdateAvailable(isUpdateAvailable));
    }, error => {
        logger.error('Failed to fetch Spot client version', { error });
        dispatch(setWebUpdateAvailable(false));
    });
}

/**
 * The action dispatched when it is or is not the time for a nightly reload.
 *
 * @param {boolean} isNightlyReloadTime - The new value.
 * @returns {{
 *    type: SET_IS_NIGHTLY_RELOAD_TIME,
 *    isNightlyReloadTime: boolean
 * }}
 */
export function setIsNightlyReloadTime(isNightlyReloadTime) {
    return {
        type: SET_IS_NIGHTLY_RELOAD_TIME,
        isNightlyReloadTime
    };
}

/**
 * Used in the tests to override the lats load time.
 *
 * @param {number} _lastLoadTime - The web source load time as timestamp.
 * @returns {{
 *     type: SET_LAST_LOAD_TIME,
 *     _lastLoadTime: number
 * }}
 * @private
 */
export function _setLastLoadTime(_lastLoadTime) {
    return {
        type: SET_LAST_LOAD_TIME,
        _lastLoadTime: new Date(_lastLoadTime)
    };
}

/**
 * The action dispatched when the update controller changes the is okay to update state.
 *
 * @param {boolean} okToUpdate - The new value.
 * @returns {{
 *     type: SET_OK_TO_UPDATE,
 *     okToUpdate: boolean
 * }}
 */
export function setOkToUpdate(okToUpdate) {
    return {
        type: SET_OK_TO_UPDATE,
        okToUpdate
    };
}

/**
 * The action dispatched when the update for web source(spot-client) becomes available.
 *
 * @param {boolean} webUpdateAvailable - The new value.
 * @returns {{
 *     type: SET_WEB_UPDATE_AVAILABLE,
 *     isWebUpdateAvailable: boolean
 * }}
 */
function setWebUpdateAvailable(webUpdateAvailable) {
    return {
        type: SET_WEB_UPDATE_AVAILABLE,
        webUpdateAvailable
    };
}

/**
 * The action is dispatched by the main update controller to inform SpotRemote/SpotTV counterparts to update their web
 * source.
 *
 * @returns {{
 *     type: UPDATE_WEB_SOURCE
 * }}
 */
export function updateWebSource() {
    return {
        type: UPDATE_WEB_SOURCE
    };
}
