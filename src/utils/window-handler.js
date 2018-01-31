export default {
    getBaseUrl() {
        return `${window.location.origin}${window.location.pathname}`;
    },

    getCurrentHost() {
        return window.location.host;
    },

    openNewWindow(url) {
        window.open(url, '_blank', 'noopener');
    },

    reload() {
        window.location = window.location.origin;
    }
};
