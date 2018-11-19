/**
 * Checks if a passed in url can be opened in the application.
 *
 * @param {string} meetingUrl
 * @param {Array<string>} validHosts
 * @return {boolean}
 */
export function isValidMeetingUrl(meetingUrl, validHosts) {
    try {
        const { domain, host, roomName } = parseMeetingUrl(meetingUrl);

        return domain && roomName && validHosts.includes(host);
    } catch (e) {
        return false;
    }
}

/**
 * Parses a meeting url so its parts can be accessed through meeting-related
 * keys.
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
        domain: `${host}${newPath}`,
        host,
        roomName
    };
}
