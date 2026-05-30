/**
 * Takes a string argument and converts to boolean using logical comparison.
 *
 * E.g. "true" or 1 or "1" are also true, butt "false" is false.
 *
 * @param value - Value to convert to boolean.
 * @returns
 */
export function getBoolean(value: string): boolean {
    try {
        const parsedValue = JSON.parse(value);

        return parsedValue === true || parsedValue === 1;
    } catch {
        return false;
    }
}
