import { parseURIString } from '@jitsi/js-utils/uri';

const ASPECT_RATIO = 16 / 9;

const MIN_HEIGHT = 180;

/**
 * Extrapolates a url for a meeting from given strings and matching domains.
 *
 * @param fieldsToSearch - The strings from which to attempt to
 * find a meeting url. Will search in order and then stop once a match is found.
 * @param knownDomains - The whitelist of meeting urls which are
 * valid matches.
 * @returns {string|undefined}
 */
export function findWhitelistedMeetingUrl(
        fieldsToSearch: string[],
        knownDomains: string[]
): string | undefined {
    const linkTerminatorPattern = '[^\\s<>$]';
    const urlRegExp
        = `http(s)?://(.*\\.)?(${knownDomains.join('|')})/${linkTerminatorPattern}+`;

    // Exclude static because jitsi meeting events may include urls to the
    // dial in info page, hosted in the static directory.
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

    return undefined;
}

/**
 * Checks a string against a positive pattern and a negative pattern. Returns
 * the string if it matches the positive pattern and doesn't provide any match
 * against the negative pattern. Null otherwise.
 *
 * @param str - The string to check.
 * @param positivePattern - The positive pattern.
 * @param negativePattern - The negative pattern.
 * @returns {string}
 */
function _checkPattern(
        str: string,
        positivePattern: string,
        negativePattern: string
): string | undefined {
    const positiveRegExp = new RegExp(positivePattern, 'gi');

    let positiveMatch = positiveRegExp.exec(str);

    while (positiveMatch !== null) {
        const url = positiveMatch[0];

        if (!new RegExp(negativePattern, 'gi').exec(url)) {
            return url;
        }

        positiveMatch = positiveRegExp.exec(str);
    }

    return undefined;
}

/**
 * Checks if a meeting name passes basic name validation.
 *
 * @param meetingName - The meeting name which may or may not be a
 * meeting that can be opened.
 * @returns {boolean}
 */
export function isValidMeetingName(meetingName?: string): boolean {
    // TODO: add some validation of the meeting name.

    // Exclude just the characters which are part of a URL for now. Don't want to go into UTF-8 territory and try
    // to figure out any special characters that may or may not be allowed.
    return Boolean(meetingName && meetingName.indexOf(':') === -1 && meetingName.indexOf('/') === -1);
}

/**
 * Checks if a passed in url can be opened in Spot.
 *
 * @param meetingUrl - The url which may or may not be a url to a jitsi
 * meeting.
 * @param knownDomains - The whitelist of meeting urls which
 * are valid matches. If not provided then all valid meeting urls are considered
 * whitelisted.
 * @returns {boolean}
 */
export function isValidMeetingUrl(meetingUrl: string, knownDomains?: string[]): boolean {
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
    } catch {
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
 * @param url - The meeting url to split into its parts.
 * @returns An object with details about the meeting location.
 */
export function parseMeetingUrl(url: string): { host: string; meetingName?: string; path: string; } {
    const { host, pathname } = new URL(url);
    const pathParts = pathname.split('/');
    const meetingName = pathParts.pop();

    return {
        host,
        meetingName,
        path: pathParts.join('/')
    };
}

/**
 * Builds the video constraints and quality objects based on the preferred
 * aspect ratio and resolution.
 *
 * @param preferredResolution - The resolution of choice.
 * @returns {Object}
 */
export const getVideoSettings = (preferredResolution: string | number) => {
    const resolution = Number(preferredResolution);

    return {
        constraints: {
            video: {
                aspectRatio: ASPECT_RATIO,
                height: {
                    ideal: resolution,
                    max: resolution,
                    min: MIN_HEIGHT
                },
                width: {
                    ideal: resolution * ASPECT_RATIO,
                    max: resolution * ASPECT_RATIO,
                    min: MIN_HEIGHT * ASPECT_RATIO
                },
                frameRate: {
                    max: 30,
                    min: 15
                }
            }
        }
    };
};
