/**
 * Checks if a meeting name passes basic name validation.
 *
 * @param {string} meetingName - The meeting name which may or may not be a
 * meeting that can be opened.
 * @returns {boolean}
 */
export function isValidMeetingName(meetingName) {
    // TODO: add some validation of the meeting name.

    // Exclude just the characters which are part of a URL for now. Don't want to go into UTF-8 territory and try
    // to figure out any special characters that may or may not be allowed.
    return meetingName && meetingName.indexOf(':') === -1 && meetingName.indexOf('/') === -1;
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
 * Determines if a url is for a Zoom meeting.
 *
 * @param {string} meetingUrl - The meeting url to check if it is for Zoom.
 * @returns {boolean}
 */
export function isZoomMeetingUrl(meetingUrl) {
    return Boolean(meetingUrl && meetingUrl.startsWith('https://zoom.us'));
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
