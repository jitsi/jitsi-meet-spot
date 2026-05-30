/**
 * A mock implementation of the react-i18next "t" function used for obtaining
 * a translated string.
 *
 * @param key - The translation key for looking up the corresponding
 * full string.
 * @returns The key.
 */
export function mockT(key: string): string {
    return key;
}
