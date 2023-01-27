/**
 * A method to generate a random string, intended to be used to create a random join code.
 *
 * @param {number} length - The desired length of the random string.
 * @returns {string}
 */
export function generateRandomString(length) {
    // XXX the method may not always give desired length above 9
    return Math.random()
        .toString(36)
        .slice(2, 2 + length);
}
