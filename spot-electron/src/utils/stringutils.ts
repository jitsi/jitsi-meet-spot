import _ from 'lodash';

/**
 * Returns an array of 2 digit hex numbers as the hex representation of the join code.
 *
 * @param joinCode - A Spot TV join code.
 * @returns {string[]}
 */
export function joinCodeToVersion(joinCode: string): string[] {
    const hexValue = parseInt(joinCode, 36).toString(16);

    return _.words(_.padStart(hexValue, 8, '0'), /\w{4,4}/g);
}
