import {
    WIRED_SCREENSHARE_SET_DEVICE_AVAILABILITY,
    WIRED_SCREENSHARE_SET_DEVICE_CONNECTED,
    WIRED_SCREENSHARE_SET_DEVICE_LABEL,
    WIRED_SCREENSHARE_SET_IDLE_VALUE
} from './action-types';

const DEFAULT_STATE = {
    available: false,
    deviceLabel: undefined,
    idleValue: undefined,
    isDeviceConnected: false
};

/**
 * A {@code Reducer} to update the current Redux state for the
 * "wiredScreenshare" feature. The "wiredScreenshare" feature stores information
 * related to the setup and automatic detection of wired screensharing.
 *
 * @param {Object} state - The current Redux state for the "wiredScreenshare"
 * feature.
 * @param {Object} action - The Redux state update payload.
 * @returns {Object}
 */
const wiredScreenshare = (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case WIRED_SCREENSHARE_SET_DEVICE_AVAILABILITY:
        return {
            ...state,
            isWiredScreenshareAvailable: action.available
        };

    case WIRED_SCREENSHARE_SET_DEVICE_CONNECTED:
        return {
            ...state,
            isDeviceConnected: action.connected
        };

    case WIRED_SCREENSHARE_SET_DEVICE_LABEL:
        return {
            ...state,
            deviceLabel: action.deviceLabel
        };

    case WIRED_SCREENSHARE_SET_IDLE_VALUE:
        return {
            ...state,
            idleValue: action.value
        };

    default:
        return state;
    }
};

export default wiredScreenshare;
