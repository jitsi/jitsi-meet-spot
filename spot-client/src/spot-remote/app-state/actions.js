import {
    clearSpotTVState,
    getSpotServicesConfig,
    setCalendarEvents
} from 'common/app-state';
import { remoteControlClient } from 'common/remote-control';
import { history } from 'common/history';

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

        return remoteControlClient.exchangeCode(joinCode, { joinCodeServiceUrl })
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
 * Stops any connection to a Spot-TV and clears redux state about the Spot-TV.
 *
 * @returns {Function}
 */
export function disconnectFromSpotTV() {
    return dispatch => {
        remoteControlClient.disconnect();

        dispatch(setCalendarEvents([]));
        dispatch(clearSpotTVState());
    };
}

/**
 * Exits the special share mode.
 *
 * @returns {Function}
 */
export function exitShareMode() {
    return dispatch => {
        dispatch({
            type: SPOT_REMOTE_EXIT_SHARE_MODE
        });

        history.push('/remote-control');
    };
}
