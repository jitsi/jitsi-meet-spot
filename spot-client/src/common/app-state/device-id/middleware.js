import { MiddlewareRegistry } from 'common/redux';

import { generate8Characters, generateGuid } from '../../utils';

import { BOOTSTRAP_STARTED } from '../bootstrap';
import { SET_ROOM_ID } from '../setup/action-types';

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
    case SET_ROOM_ID: {
        const deviceId = getDeviceId(getState());
        const roomId = action.id;

        // Update the device ID to start with the room ID.
        // At the time of this writing the purpose is to easier find device logs for devices
        // connected to specific room. Remove once the problem is solved in another way.
        if (roomId && (!deviceId || !deviceId.startsWith(roomId))) {
            const newDeviceId = `${roomId}-${generate8Characters()}`;

            dispatch(setDeviceId(newDeviceId));
        }
    }
        break;
    }

    return result;
});
