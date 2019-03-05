
/**
 * A selector which returns the video input device to use when screensharing
 * through a physical connection.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getWiredScreenshareInputLabel(state) {
    return state.wiredScreenshare.deviceLabel;
}

/**
* A selector which returns the idle state of the video input device to use
* when screensharing.
*
* @param {Object} state - The Redux state.
* @returns {string}
*/
export function getWiredScreenshareInputIdleValue(state) {
    return state.wiredScreenshare.idleValue;
}

/**
* A selector which returns whether or not a device has been detected to be
* connected with the wired screensharing input.
*
* @param {Object} state - The Redux state.
* @returns {boolean}
*/
export function isDeviceConnectedForWiredScreensharing(state) {
    return Boolean(state.wiredScreenshare.isDeviceConnected);
}

/**
* A selector which returns whether or not the configured screensharing input
* device is plugged in.
*
* @param {Object} state - The Redux state.
* @returns {boolean}
*/
export function isWiredScreenshareInputAvailable(state) {
    return Boolean(state.wiredScreenshare.available);
}
