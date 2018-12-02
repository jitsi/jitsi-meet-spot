/**
 * A set up utilities wrapping native window methods to prevent direct access
 * of the global window.
 */
export default {
    /**
     * Returns the current url of the application, excluding any query params
     * and fragments.
     *
     * @returns {string}
     */
    getBaseUrl() {
        return `${window.location.origin}${window.location.pathname}`;
    },

    /**
     * Opens a popup window with the provided url.
     *
     * @param {string} url - The url to go to in the new window.
     * @param {string} name - The identifying name to give the new window.
     * @param {Object} options - The windows features settings to override.
     * @returns {Window}
     */
    openNewWindow(url, name = '_blank', options = {}) {
        const windowFeatures = Object.entries(options)
            .map(([ key, value ]) => `${key}=${value}`)
            .join(',');

        return window.open(url, name, windowFeatures);
    },

    /**
     * Reloads the current page by visiting the origin.
     *
     * @returns {void}
     */
    reload() {
        window.location = window.location.origin;
    }
};
