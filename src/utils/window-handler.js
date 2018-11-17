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
     * @returns {void}
     */
    openNewWindow(url) {
        window.open(url, '_blank', 'noopener');
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
