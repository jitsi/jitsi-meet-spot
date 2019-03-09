import { generateRoomWithoutSeparator } from 'js-utils/random';

/**
 * Generates a new room name.
 *
 * @returns {string} A newly-generated room name.
 */
export function getRandomMeetingName() {
    return generateRoomWithoutSeparator();
}
