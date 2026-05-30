import { ADJUST_VOLUME } from './action-types';

/**
 * Action to be dispatched when the volume of the spot instance should be adjusted up or down. This
 * is only available for electron spot instances.
 *
 * @param direction - One of 'up', 'down'.
 * @returns
 */
export function adjustVolume(direction: string): {
    type: string;
    direction: string;
} {
    return {
        type: ADJUST_VOLUME,
        direction
    };
}
