/**
 * Extrapolates a url for a jitsi meeting from a given string.
 *
 * @param {string} location - A string which may contains a jitsi meeting url.
 * @private
 * @returns {string}
 */
export function getMeetingUrl(location) {
    // eslint-disable-next-line no-useless-escape
    const linkRegex = /https?:\/\/[^\s]+\/([^\s\/]+)/g;
    const matches = linkRegex.exec(location);

    if (!matches || !matches.length) {
        return;
    }

    // eslint-disable-next-line no-useless-escape
    return matches[0].replace(/,\s*$/, '');
}
