/**
* A selector which returns the current device identifier which is persisted across the app restarts
* and can be used by various services to identify a device.
*
* @param {Object} state - The Redux state.
* @returns {string}
*/
export function getDeviceId(state) {
    return state.deviceId.deviceId;
}
