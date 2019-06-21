/**
 * A set up utilities wrapping native window methods to prevent direct access
 * of the global window.
 */
export default {
    /**
     * Returns the url that is hosting this Spot instance, excluding any query
     * params and fragments.
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

        return `${origin}${newPath}`;
    },

    /**
     * Returns the current url host--the base url without protocol.
     *
     * @returns {string}
     */
    getHost() {
        const url = new URL(window.location);

        return url.host;
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
        window.location.reload();
    }
};
