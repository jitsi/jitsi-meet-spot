import md5 from 'md5';

/**
 * Create a hash of the passed in string.
 *
 * @param string - The text to convert to a hash.
 * @returns
 */
export function hash(string: string): string {
    return md5(string);
}
