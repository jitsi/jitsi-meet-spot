import {
    SET_DEVICE_ID, SET_SPOT_INSTANCE_INFO
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

/**
 * Sets the extra information that can be used to generate a new device ID if
 * needed.
 *
 * @param {string} roomId - A Spot room ID assigned by teh backend.
 * @param {boolean} isSpotTv - Tells whether it's a Spot TV or a Spot Remote.
 * @param {boolean} isPairingPermanent - When set to true means that it's a permanent backend pairing using long lived
 * pairing code.
 * @returns {Object}
 */
export function setSpotInstanceInfo({ roomId, isSpotTv, isPairingPermanent }) {
    return {
        type: SET_SPOT_INSTANCE_INFO,
        roomId,
        isSpotTv,
        isPairingPermanent
    };
}
