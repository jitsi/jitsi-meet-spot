import md5 from 'md5';

/**
 * Create a hash of the passed in string.
 *
 * @param {string} string - The text to convert to a hash.
 * @returns {string}
 */
export function hash(string) {
    return md5(string);
}
