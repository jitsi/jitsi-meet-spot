import { ADJUST_VOLUME } from './action-types';

/**
 * Action to be dispatched when the volume of the spot instance should be adjusted up or down. This
 * is only available for electron spot instances.
 *
 * @param {string} direction - One of 'up', 'down'.
 * @returns {{
 *     type: ADJUST_VOLUME,
 *     direction: string
 * }}
 */
export function adjustVolume(direction) {
    return {
        type: ADJUST_VOLUME,
        direction
    };
}
