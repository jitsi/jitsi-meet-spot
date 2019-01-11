/**
 * Checks if a meeting name passes basic name validation.
 *
 * @param {string} meetingName - The meeting name which may or may not be a
 * meeting that can be opened.
 * @returns {boolean}
 */
export function isValidMeetingName(meetingName) {
    // TODO: add some validation of the meeting name.

    return Boolean(meetingName);
}

/**
 * Checks if a passed in url can be opened in Spot.
 *
 * @param {string} meetingUrl - The url which may or may not be a url to a jitsi
 * meeting.
 * @returns {boolean}
 */
export function isValidMeetingUrl(meetingUrl) {
    try {
        const { meetingName } = parseMeetingUrl(meetingUrl);

        return Boolean(meetingName) && isValidMeetingName(meetingName);
    } catch (e) {
        return false;
    }
}

/**
 * Parses a meeting url so its parts can be accessed through meeting-related
 * keys. For example: 'https://meet.jit.si/path/meeting' would be returned as:
 * {
 *     host: 'meet.jit.si',
 *     meetingName: 'meeting',
 *     path: '/path'
 * }.
 *
 * @param {string} url - The meeting url to split into its parts.
 * @returns {Object} An object with details about the meeting location.
 */
export function parseMeetingUrl(url) {
    const { host, pathname } = new URL(url);
    const pathParts = pathname.split('/');
    const meetingName = pathParts.pop();

    return {
        host,
        meetingName,
        path: pathParts.join('/')
    };
}
