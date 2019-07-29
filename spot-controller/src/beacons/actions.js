import { RESET_BEACON_NOTIFICATION_FLAG, UPDATE_BEACONS, UPDATE_JOIN_READY } from './actionTypes';

/**
 * Action to reset the beacon notification flag.
 *
 * @returns {{
 *     type: RESET_BEACON_NOTIFICATION_FLAG
 * }}
 */
export function resetBeaconNotificationFlag() {
    return {
        type: RESET_BEACON_NOTIFICATION_FLAG
    };
}

/**
 * Action to signal the reception of an updated beacon list.
 *
 * @param {Array<Object>} beacons - The beacon list that was recently received.
 * @returns {{
 *     beacons: Array<Object>,
 *     type: SET_BEACONS
 * }}
 */
export function updateBeacons(beacons) {
    return {
        beacons,
        type: UPDATE_BEACONS
    };
}

/**
 * Action to update the readyness state of the embedded remote.
 *
 * @param {boolean} joinReady - The new state.
 * @returns {{
 *     type: UPDATE_JOIN_READY,
 *     joinReady: boolean
 * }}
*/
export function updateJoinReady(joinReady) {
    return {
        type: UPDATE_JOIN_READY,
        joinReady
    };
}
