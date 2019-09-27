/**
 * A mock implementation of the react-i18next "t" function used for obtaining
 * a translated string.
 *
 * @param {string} key - The translation key for looking up the corresponding
 * full string.
 * @returns {string} The key.
 */
export function mockT(key) {
    return key;
}
