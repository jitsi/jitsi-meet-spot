import { generateRoomWithoutSeparator } from '@jitsi/js-utils/random';

/**
 * Generates a new room name.
 *
 * @returns A newly-generated room name.
 */
export function getRandomMeetingName(): string {
    return generateRoomWithoutSeparator();
}
