const storage = window.localStorage;

/**
 * A wrapper around local storage so it does not have to be accessed directly.
 */
export default {
    /**
     * Gets stored data by the given key and converts it for direct
     * manipulation.
     *
     * @param {string} key
     * @returns {*}
     */
    get(key) {
        const value = storage.getItem(key);

        return value === 'undefined' || !value
            ? undefined : JSON.parse(value);
    },

    /**
     * Updates persisted data at the given key with the given data.
     *
     * @param {string} key
     * @param {*} value
     * @returns {void}
     */
    set(key, value) {
        storage.setItem(key, JSON.stringify(value));
    },

    /**
     * Deletes any persisted data stored under the given key.
     *
     * @param {*} key
     * @returns {void}
     */
    remove(key) {
        storage.removeItem(key);
    },

    /**
     * Remotes all persisted data.
     *
     * @returns {void}
     */
    reset() {
        storage.clear();
    }
};
