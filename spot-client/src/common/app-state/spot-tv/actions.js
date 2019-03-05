import {
    SPOT_TV_CLEAR_STATE,
    SPOT_TV_SET_JOIN_CODE,
    SPOT_TV_SET_MUC_LOCK,
    SPOT_TV_SET_MUC_ROOM,
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
* Updates the known lock set on the Spot-TV's MUC.
*
* @param {string} lock - The latest lock string.
* @returns {Object}
*/
export function setLock(lock) {
    return {
        type: SPOT_TV_SET_MUC_LOCK,
        lock
    };
}

/**
* Updates the known MUC name being joined by the Spot-TV. Spot-Remotes join the
* same MUC to communicate with Spot-TV.
*
* @param {string} roomName - The latest room name.
* @returns {Object}
*/
export function setRoomName(roomName) {
    return {
        type: SPOT_TV_SET_MUC_ROOM,
        roomName
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
