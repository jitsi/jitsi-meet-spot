import {
    SET_DEVICE_ID, SET_SPOT_INSTANCE_INFO
} from './action-types';

/**
 * The action dispatched when the device ID is being changed or set initially.
 *
 * @param deviceId - The new device ID string to be used.
 * @returns
 */
export function setDeviceId(deviceId: string): any {
    return {
        type: SET_DEVICE_ID,
        deviceId
    };
}

/**
 * Sets the extra information that can be used to generate a new device ID if
 * needed.
 *
 * @param roomId - A Spot room ID assigned by teh backend.
 * @param isSpotTv - Tells whether it's a Spot TV or a Spot Remote.
 * @param isPairingPermanent - When set to true means that it's a permanent backend pairing using long lived
 * pairing code.
 * @returns
 */
export function setSpotInstanceInfo({ roomId, isSpotTv, isPairingPermanent }: {
    roomId: string;
    isSpotTv: boolean;
    isPairingPermanent: boolean;
}): any {
    return {
        type: SET_SPOT_INSTANCE_INFO,
        roomId,
        isSpotTv,
        isPairingPermanent
    };
}
