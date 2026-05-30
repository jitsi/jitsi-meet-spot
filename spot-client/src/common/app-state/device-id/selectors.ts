/**
* A selector which returns the current device identifier which is persisted across the app restarts
* and can be used by various services to identify a device.
*
* @param state - The Redux state.
* @returns
*/
export function getDeviceId(state: any): string {
    return state.deviceId.deviceId;
}
