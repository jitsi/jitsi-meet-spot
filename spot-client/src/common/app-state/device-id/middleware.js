import { MiddlewareRegistry } from 'common/redux';

import { generate8Characters, generateGuid } from '../../utils';

import { BOOTSTRAP_STARTED } from '../bootstrap';

import { SET_SPOT_INSTANCE_INFO } from './action-types';
import { setDeviceId } from './actions';
import { getDeviceId } from './selectors';

MiddlewareRegistry.register(({ dispatch, getState }) => next => action => {
    const result = next(action);

    switch (action.type) {
    case BOOTSTRAP_STARTED: {
        const deviceId = getDeviceId(getState()) || generateGuid();

        dispatch(setDeviceId(deviceId));
    }
        break;
    case SET_SPOT_INSTANCE_INFO: {
        const deviceId = getDeviceId(getState());
        const {
            roomId,
            isSpotTv,
            isPairingPermanent
        } = action;
        const deviceIdPrefix = _getDeviceIdPrefix(roomId, isSpotTv, isPairingPermanent);

        // Update the device ID to start with the room ID.
        // At the time of this writing the purpose is to easier find device logs for devices
        // connected to specific room. Remove once the problem is solved in another way.
        if (roomId && (!deviceId || !deviceId.startsWith(deviceIdPrefix))) {
            const newDeviceId = `${deviceIdPrefix}-${generate8Characters()}`;

            dispatch(setDeviceId(newDeviceId));
        }
    }
        break;
    }

    return result;
});

/**
 * Generates a device ID prefix.
 *
 * @param {string} roomId - The room ID assigned by the backend.
 * @param {boolean} isSpotTv - Spot TV or Spot Remote ?
 * @param {boolean} isPairingPermanent - Is it permanent(long lived) backend pairing.
 * @returns {string}
 * @private
 */
function _getDeviceIdPrefix(roomId, isSpotTv, isPairingPermanent) {
    const middlePart
        = isSpotTv
            ? 'spot-tv'
            : isPairingPermanent
                ? 'remote-perm'
                : 'remote-temp';

    return `${roomId}-${middlePart}`;
}
