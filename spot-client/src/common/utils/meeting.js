import { parseURIString } from 'js-utils/uri';

/**
 * Extrapolates a url for a meeting from given strings and matching domains.
 *
 * @param {Array<string>} fieldsToSearch - The strings from which to attempt to
 * find a meeting url. Will search in order and then stop once a match is found.
 * @param {Array<string>} knownDomains - The whitelist of meeting urls which are
 * valid matches.
 * @returns {string|undefined}
 */
export function findWhitelistedMeetingUrl(fieldsToSearch, knownDomains) {
    const linkTerminatorPattern = '[^\\s<>$]';
    const urlRegExp
        = `http(s)?://(${knownDomains.join('|')})/${linkTerminatorPattern}+`;
    const excludePattern = '/static/';

    for (const field of fieldsToSearch) {
        if (typeof field === 'string') {
            const match = _checkPattern(field, urlRegExp, excludePattern);

            if (match) {
                const url = parseURIString(match);

                if (url) {
                    return url.toString();
                }
            }
        }
    }
}

/**
 * Checks a string against a positive pattern and a negative pattern. Returns
 * the string if it matches the positive pattern and doesn't provide any match
 * against the negative pattern. Null otherwise.
 *
 * @param {string} str - The string to check.
 * @param {string} positivePattern - The positive pattern.
 * @param {string} negativePattern - The negative pattern.
 * @returns {string}
 */
function _checkPattern(str, positivePattern, negativePattern) {
    const positiveRegExp = new RegExp(positivePattern, 'gi');

    let positiveMatch = positiveRegExp.exec(str);

    while (positiveMatch !== null) {
        const url = positiveMatch[0];

        if (!new RegExp(negativePattern, 'gi').exec(url)) {
            return url;
        }

        positiveMatch = positiveRegExp.exec(str);
    }
}

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
 * @param {Array<string>} [knownDomains] - The whitelist of meeting urls which
 * are valid matches. If not provided then all valid meeting urls are considered
 * whitelisted.
 * @returns {boolean}
 */
export function isValidMeetingUrl(meetingUrl, knownDomains) {
    try {
        const { meetingName } = parseMeetingUrl(meetingUrl);

        if (!meetingName) {
            return false;
        }

        const isValidName = isValidMeetingName(meetingName);

        if (!isValidName) {
            return false;
        }

        return !knownDomains || Boolean(findWhitelistedMeetingUrl([ meetingUrl ], knownDomains));
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
