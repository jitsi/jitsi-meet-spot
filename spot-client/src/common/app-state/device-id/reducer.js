import {
    SET_DEVICE_ID
} from './action-types';

/**
* A {@code Reducer} to update the current Redux state for the 'deviceId' feature.
*
* @param {Object} state - The current Redux state for the 'deviceId' feature.
* @param {Object} action - The Redux state update payload.
* @returns {Object}
*/
const deviceId = (state = { }, action) => {
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
