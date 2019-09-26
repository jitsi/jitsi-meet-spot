import { parseURIString } from 'js-utils/uri';

/**
 * Extrapolates a url for a Jitsi-Meet meeting from a given string.
 *
 * @param {Array<string>} fieldsToSearch - The strings from which to attempt to
 * find a meeting url. Will search in order and then stop once a match is found.
 * @param {Array<string>} knownDomains - The whitelist of meeting urls which are
 * valid matches.
 * @returns {string|undefined}
 */
export function getMeetingUrl(fieldsToSearch, knownDomains) {
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
