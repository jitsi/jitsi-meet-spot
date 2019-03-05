/**
 * Spots may experience states that are difficult to debug from logs alone. As
 * such features are allowed to expose globals for the sake of debugging through
 * the browser console.
 */

// All debugging is available within the "spot" namespace.
window.spot = {};

export default {
    register(name, debugObject) {
        window.spot[name] = debugObject;
    }
};
