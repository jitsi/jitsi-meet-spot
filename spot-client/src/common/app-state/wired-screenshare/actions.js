import {
    WIRED_SCREENSHARE_SET_DEVICE_CONNECTED,
    WIRED_SCREENSHARE_SET_INPUT_IDLE_VALUE,
    WIRED_SCREENSHARE_SET_INPUT_LABEL
} from './action-types';

/**
 * Signals a device has connected or disconnected from wired screensharing.
 *
 * @param {boolean} connected - Whether or not a device is connected to wired
 * screensharing.
 * @returns {Object}
 */
export function setWiredScreenshareDeviceConnected(connected) {
    return {
        type: WIRED_SCREENSHARE_SET_DEVICE_CONNECTED,
        connected
    };
}

/**
 * Signals to store the initial rgba sum for the screensharing video input
 * source while it is idle. When the rgba sum for the input changes, compared
 * to the stored initial value, then it is assumed a device has been plugged
 * in.
 *
 * @param {string} value - The rgba sum of all pixels form the source while
 * idle.
 * @returns {Object}
 */
export function setWiredScreenshareInputIdleValue(value) {
    return {
        type: WIRED_SCREENSHARE_SET_INPUT_IDLE_VALUE,
        value
    };
}

/**
 * Signals to store the preferred video input source for screensharing with
 * a physical connector.
 *
 * @param {string} deviceLabel - The label value set to the video input device
 * as listed by WebRTC (enumerateDevices).
 * @returns {Object}
 */
export function setWiredScreenshareInputLabel(deviceLabel) {
    return {
        type: WIRED_SCREENSHARE_SET_INPUT_LABEL,
        deviceLabel
    };
}
