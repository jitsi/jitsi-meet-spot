/**
 * Takes a string argument and converts to boolean using logical comparison.
 *
 * E.g. "true" or 1 or "1" are also true, butt "false" is false.
 *
 * @param {string} value - Value to convert to boolean.
 * @returns {boolean}
 */
export function getBoolean(value) {
    try {
        const parsedValue = JSON.parse(value);

        return parsedValue === true || parsedValue === 1;
    } catch (e) {
        return false;
    }
}
