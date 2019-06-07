/**
 * An event emitter implementation intended for an object to become an
 * observable.
 */
export default class Emitter {
    /**
     * Creates a {@code Emitter} instance.
     */
    constructor() {
        this._emitterListeners = new Map();
    }

    /**
     * Adds a callback that should be notified when the given eventName is
     * emitted.
     *
     * @param {string} eventName - The event which should trigger the callback.
     * @param {Function} listener - The callback to be executed when the event
     * is fired.
     * @returns {Function} To invoke to unsubscribe the callback.
     */
    addListener(eventName, listener) {
        if (!this._emitterListeners.has(eventName)) {
            this._emitterListeners.set(eventName, new Set());
        }

        const listeners = this._emitterListeners.get(eventName);

        listeners.add(listener);

        return () => this.removeListener(eventName, listener);
    }

    /**
     * Notifies registered callbacks that an event has been fired.
     *
     * @param {string} eventName - The event which should trigger the callbacks.
     * @param  {...any} rest - Additional details about the event.
     * @returns {void}
     */
    emit(eventName, ...rest) {
        const listeners = this._emitterListeners.get(eventName);

        if (listeners) {
            listeners.forEach(listener => listener(...rest));
        }
    }

    /**
     * Returns the number of registered callbacks for a given event.
     *
     * @param {string} eventName - The even which should have its callbacks
     * counted.
     * @returns {number}
     */
    listenerCount(eventName) {
        const listeners = this._emitterListeners.get(eventName);

        if (listeners) {
            return listeners.size;
        }

        return 0;
    }

    /**
     * Removes all registered callbacks for all events.
     *
     * @returns {void}
     */
    removeAllListeners() {
        this._emitterListeners = new Map();
    }

    /**
     * Removes a callback from being executed when the given eventName is fired.
     *
     * @param {string} eventName - The event which should not longer trigger the
     * callback.
     * @param {Function} listener - The callback to be removed.
     * @returns {void}
     */
    removeListener(eventName, listener) {
        const listeners = this._emitterListeners.get(eventName);

        if (listeners) {
            listeners.delete(listener);
        }
    }
}
