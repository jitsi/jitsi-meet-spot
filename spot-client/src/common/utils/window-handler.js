/**
 * A set up utilities wrapping native window methods to prevent direct access
 * of the global window.
 */
export default {
    /**
     * Returns the current url of the current window, excluding any query params
     * and fragments.
     *
     * @returns {string}
     */
    getBaseUrl() {
        const origin = window.location.origin;
        const pathParts = window.location.pathname.split('/');

        pathParts.length = pathParts.length - 1;

        const newPath = pathParts.reduce((accumulator, currentValue) => {
            if (currentValue) {
                return `${accumulator}/${currentValue}`;
            }

            return accumulator;
        }, '');

        const url = `${origin}${newPath}`;

        return url.replace(/^https?:\/\//i, '');
    },

    /**
     * Returns the current url host--the base url without protocol.
     *
     * @returns {string}
     */
    getHost() {
        return window.location.hostname;
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
