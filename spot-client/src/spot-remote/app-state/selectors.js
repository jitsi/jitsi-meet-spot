/**
 * Obtains information about a Spot room required by a Spot Remote to connect to a Spot TV.
 *
 * @param {Object} state - The Redux state.
 * @returns {{
 *     roomName: string,
 *     roomLock: string
 * }}
 */
export function getRoomInfo(state) {
    return state.spotRemote.roomInfo;
}
