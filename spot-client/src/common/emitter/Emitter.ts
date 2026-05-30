type Listener = (...args: any[]) => void;

/**
 * An event emitter implementation intended for an object to become an
 * observable.
 */
export default class Emitter {
    private _emitterListeners: Map<string, Set<Listener>>;

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
     * @param eventName - The event which should trigger the callback.
     * @param listener - The callback to be executed when the event is fired.
     * @returns {Function} To invoke to unsubscribe the callback.
     */
    addListener(eventName: string, listener: Listener): () => void {
        let listeners = this._emitterListeners.get(eventName);

        if (!listeners) {
            listeners = new Set();
            this._emitterListeners.set(eventName, listeners);
        }

        listeners.add(listener);

        return () => this.removeListener(eventName, listener);
    }

    /**
     * Notifies registered callbacks that an event has been fired.
     *
     * @param eventName - The event which should trigger the callbacks.
     * @param rest - Additional details about the event.
     * @returns {void}
     */
    emit(eventName: string, ...rest: any[]): void {
        const listeners = this._emitterListeners.get(eventName);

        if (listeners) {
            listeners.forEach(listener => listener(...rest));
        }
    }

    /**
     * Returns the number of registered callbacks for a given event.
     *
     * @param eventName - The event which should have its callbacks counted.
     * @returns {number}
     */
    listenerCount(eventName: string): number {
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
    removeAllListeners(): void {
        this._emitterListeners = new Map();
    }

    /**
     * Removes a callback from being executed when the given eventName is fired.
     *
     * @param eventName - The event which should no longer trigger the callback.
     * @param listener - The callback to be removed.
     * @returns {void}
     */
    removeListener(eventName: string, listener: Listener): void {
        const listeners = this._emitterListeners.get(eventName);

        if (listeners) {
            listeners.delete(listener);
        }
    }
}
