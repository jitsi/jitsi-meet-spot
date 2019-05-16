import { nativeController } from '../native-controller';

/**
 * Adjusts the volume of the running host through the native interface, when available.
 *
 * @param {string} direction - The direction of the adjustment. One of 'up' or 'down'.
 * @returns {boolean}
 */
export function adjustVolume(direction) {
    nativeController.sendMessage('adjustVolume', {
        direction
    });
}
