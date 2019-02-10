/**
 * Utilities for interacting with the application background image.
 */
export default {
    /**
     * Load a given external image in memory so it is cached and ready for
     * immediate display.
     *
     * @param {string} imageUrl - The url of the image to load.
     * @returns {Promise} Resolves when the image has completed loading; rejects
     * if an error occurred while loading the image.
     */
    loadBackground(imageUrl) {
        return new Promise((resolve, reject) => {
            const image = new Image();

            image.onload = resolve;
            image.onerror = reject;

            image.src = imageUrl;
        });
    }
};
