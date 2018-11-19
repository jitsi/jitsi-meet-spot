/**
 * Checks if a passed in url can be opened in the application.
 *
 * @param {string} meetingUrl
 * @return {boolean}
 */
export function isValidMeetingUrl(meetingUrl) {
    try {
        const { roomName } = parseMeetingUrl(meetingUrl);

        return Boolean(roomName);
    } catch (e) {
        return false;
    }
}

/**
 * Parses a meeting url so its parts can be accessed through meeting-related
 * keys. For example: 'https://meet.jit.si/path/meeting' would be returned as:
 * {
 *     host: 'meet.jit.si',
 *     path: '/path',
 *     roomName: 'meeting'
 * }
 *
 * @param {string} url
 * @return {Object} An object with details about the meeting location.
 */
export function parseMeetingUrl(url) {
    const { host, pathname } = new URL(url);
    const pathParts = pathname.split('/');
    const roomName = pathParts.pop();

    return {
        path: pathParts.join('/'),
        host,
        roomName
    };
}
