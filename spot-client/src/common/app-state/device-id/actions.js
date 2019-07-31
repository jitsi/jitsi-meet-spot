import {
    SET_DEVICE_ID
} from './action-types';

/**
 * The action dispatched when the device ID is being changed or set initially.
 *
 * @param {string} deviceId - The new device ID string to be used.
 * @returns {Object}
 */
export function setDeviceId(deviceId) {
    return {
        type: SET_DEVICE_ID,
        deviceId
    };
}
