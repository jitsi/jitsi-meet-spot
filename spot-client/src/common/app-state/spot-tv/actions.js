import {
    SPOT_TV_CLEAR_STATE,
    SPOT_TV_SET_JOIN_CODE,
    SPOT_TV_SET_STATE
} from './action-types';

/**
 * Removes all knowledge of Spot-TV state.
 *
 * @returns {Object}
 */
export function clearSpotTVState() {
    return {
        type: SPOT_TV_CLEAR_STATE
    };
}

/**
* Updates the known join code for connecting a Spot-Remote to a Spot-TV.
*
* @param {string} joinCode - The string necessary for a Spot-Remote to
* connect to a Spot-TV.
* @returns {Object}
*/
export function setJoinCode(joinCode) {
    return {
        type: SPOT_TV_SET_JOIN_CODE,
        joinCode
    };
}

/**
 * Generic action arbitrarily updating the known state of Spot-TV.
 *
 * @param {Object} newState - The new state to be stored in redux.
 * @returns {Object}
 */
export function setSpotTVState(newState) {
    return {
        type: SPOT_TV_SET_STATE,
        newState
    };
}
