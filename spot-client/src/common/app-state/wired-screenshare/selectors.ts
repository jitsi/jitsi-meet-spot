
/**
 * A selector which returns the video input device to use when screensharing
 * through a physical connection.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getWiredScreenshareInputLabel(state: any) {
    return state.wiredScreenshare.deviceLabel;
}

/**
* A selector which returns the idle state of the video input device to use
* when screensharing.
*
* @param state - The Redux state.
* @returns
*/
export function getWiredScreenshareInputIdleValue(state: any) {
    return state.wiredScreenshare.idleValue;
}

/**
* A selector which returns whether or not a device has been detected to be
* connected with the wired screensharing input.
*
* @param state - The Redux state.
* @returns
*/
export function isDeviceConnectedForWiredScreensharing(state: any) {
    return Boolean(state.wiredScreenshare.isDeviceConnected);
}

/**
* A selector which returns whether or not the configured screensharing input
* device is plugged in.
*
* @param state - The Redux state.
* @returns
*/
export function isWiredScreenshareInputAvailable(state: any) {
    return Boolean(state.wiredScreenshare.available);
}
