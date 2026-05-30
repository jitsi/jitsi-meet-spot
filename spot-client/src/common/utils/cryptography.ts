/**
 * Generate a GUID.
 *
 * @private
 * @returns The generated string.
 */
export function generateGuid(): string {
    return window.crypto.randomUUID();
}
