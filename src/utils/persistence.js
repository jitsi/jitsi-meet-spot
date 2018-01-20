const storage = window.localStorage;

export default {
    get(key) {
        const value = storage.getItem(key);

        return value === 'undefined' || !value
            ? undefined : JSON.parse(value);
    },

    set(key, value) {
        storage.setItem(key, JSON.stringify(value));
    },

    remove(key) {
        storage.removeItem(key);
    },

    reset() {
        storage.clear();
    }
};
