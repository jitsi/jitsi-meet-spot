import { getSpotServicesConfig } from 'common/app-state';
import { remoteControlService } from 'common/remote-control';

import {
    SPOT_REMOTE_EXIT_SHARE_MODE,
    SPOT_REMOTE_JOIN_CODE_INVALID,
    SPOT_REMOTE_JOIN_CODE_VALID,
    SPOT_REMOTE_WILL_VALIDATE_JOIN_CODE
} from './actionTypes';

/**
 * Connects Spot Remote to Spot TV.
 *
 * @param {string} joinCode - The join code.
 * @param {boolean} shareMode - Indicates whether the Spot Remote is running in the special screen share mode or not.
 * @returns {Function}
 */
export function connectToSpotTV(joinCode, shareMode) {
    return (dispatch, getState) => {
        dispatch({
            type: SPOT_REMOTE_WILL_VALIDATE_JOIN_CODE,
            joinCode,
            shareMode
        });

        const { joinCodeServiceUrl } = getSpotServicesConfig(getState());

        return remoteControlService.exchangeCode(joinCode, { joinCodeServiceUrl })
            .then(roomInfo => {
                dispatch({
                    type: SPOT_REMOTE_JOIN_CODE_VALID,
                    joinCode,
                    roomInfo,
                    shareMode
                });
            }, error => {
                dispatch({
                    type: SPOT_REMOTE_JOIN_CODE_INVALID,
                    joinCode,
                    shareMode
                });

                throw error;
            });
    };
}

/**
 * Exits the special share mode.
 *
 * @param {Object} history - The history object user for navigating the browser.
 * @returns {Function}
 */
export function exitShareMode(history) {
    return dispatch => {
        dispatch({
            type: SPOT_REMOTE_EXIT_SHARE_MODE
        });

        history.push('/remote-control');
    };
}
