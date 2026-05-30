import {
    SET_DEVICE_ID
} from './action-types';

/**
* A {@code Reducer} to update the current Redux state for the 'deviceId' feature.
*
* @param state - The current Redux state for the 'deviceId' feature.
* @param action - The Redux state update payload.
* @returns
*/
const deviceId = (state: any = { }, action: any) => {
    switch (action.type) {

    case SET_DEVICE_ID: {
        return {
            ...state,
            deviceId: action.deviceId
        };
    }

    default:
        return state;
    }
};

export default deviceId;
