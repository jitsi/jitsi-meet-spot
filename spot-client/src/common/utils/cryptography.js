/**
 * Generate a GUID.
 *
 * @private
 * @returns {string} The generated string.
 */
export function generateGuid() {
    return window.crypto.randomUUID();
}
