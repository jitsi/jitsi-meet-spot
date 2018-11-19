/**
 * Checks if a passed in url can be opened in the application.
 *
 * @param {string} meetingUrl
 * @param {Array<string>} validHosts
 * @return {boolean}
 */
export function isValidMeetingUrl(meetingUrl, validHosts) {
    try {
        const { host, roomName } = parseMeetingUrl(meetingUrl);

        return host && roomName && validHosts.includes(host);
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
    const newPath = pathParts.reduce((accumulator, currentValue) => {
        if (currentValue) {
            return `${accumulator}/${currentValue}`;
        }

        return accumulator;
    }, '');

    return {
        path: newPath,
        host,
        roomName
    };
}
