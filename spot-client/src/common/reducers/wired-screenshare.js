const DEFAULT_STATE = {
    deviceLabel: undefined,
    idleValue: undefined,
    isDeviceConnected: false
};

export const WIRED_SCREENSHARE_SET_DEVICE_LABEL
    = 'WIRED_SCREENSHARE_SET_DEVICE_LABEL';
export const WIRED_SCREENSHARE_SET_IDLE_VALUE
    = 'WIRED_SCREENSHARE_SET_IDLE_VALUE';
export const WIRED_SCREENSHARE_SET_DEVICE_CONNECTED
    = 'WIRED_SCREENSHARE_SET_DEVICE_CONNECTED';

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

/**
 * A selector which returns the video input device to use when screensharing
 * through a physical connection.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getScreenshareDevice(state) {
    return state.wiredScreenshare.deviceLabel;
}

/**
 * A selector which returns the idle state of the video input device to use
 * when screensharing.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getScreenshareDeviceIdleValue(state) {
    return state.wiredScreenshare.idleValue;
}

/**
 * A selector which returns whether or not a device has been detected to be
 * connected with the wired screensharing input.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isScreenShareDeviceConnect(state) {
    return Boolean(state.wiredScreenshare.isDeviceConnected);
}
