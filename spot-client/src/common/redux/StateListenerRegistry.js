// Reaching directly to the logger in order to avoid circular dependency
import logger from '../logger/logger';

/**
 * The type listener supported for registration with {@link StateListenerRegistry} in association with
 * a {@link Selector}.
 *
 * @typedef {Function} Listener
 * @param {any} selection - The value derived from the redux store/state by the associated {@code Selector}. Immutable!
 * @param {Store} store - The redux store. Provided in case the {@code Listener} needs to {@code dispatch} or
 * {@code getState}. The latter is advisable only if the {@code Listener} is not to respond to changes to that state.
 * @param {any} prevSelection - The value previously derived from the redux store/state by the associated
 * {@code Selector}. The {@code Listener} is invoked only if {@code prevSelection} and {@code selection} are
 * different. Immutable!
 */

/**
 * The type selector supported for registration with {@link StateListenerRegistry} in association with
 * a {@link Listener}.
 *
 * @typedef {Function} Selector
 * @param {Object} state - The redux state from which the {@code Selector} is to derive data.
 * @param {any} prevSelection - The value previously derived from the redux store/state by the {@code Selector}.
 * Provided in case the {@code Selector} needs to derive the returned value from the specified {@code state} and
 * {@code prevSelection}. Immutable!
 * @returns {any} The value derived from the specified {@code state} and/or {@code prevSelection}. The associated
 * {@code Listener} will only be invoked if the returned value is other than {@code prevSelection}.
 */

/**
 * A type of a {@link Selector}-{@link Listener} association in which the {@code Listener} listens to changes in
 * the values derived from a redux store/state by the {@code Selector}.
 *
 * @typedef {Object} SelectorListener
 * @property {Listener} Listens to changes in the values selected by {@link selector}.
 * @property {Selector} Selects values whose changes are listened to by {@link listener}.
 */

/**
 * A registry listeners which listen to changes in a redux store/state.
 */
class StateListenerRegistry {
    /**
     * The {@link Listener}s registered with this {@code StateListenerRegistry} to be notified when the values derived
     * by associated {@link Selector}s from a redux store/state change.
     *
     * @type {Set<SelectorListener>}
     */
    _selectorListeners = new Set();

    /**
     * Invoked by a specific redux store any time an action is dispatched, and some part of the state (tree) may
     * potentially have changed.
     *
     * @param {Map<SelectorListener, any>} prevSelections - The map holding previous selections for each
     * {@code SelectorListener}.
     * @param {Store} store - The Redux store.
     * @returns {void}
     */
    _listener({ prevSelections, store }) {
        for (const selectorListener of this._selectorListeners) {
            const prevSelection = prevSelections.get(selectorListener);

            try {
                const selection
                    = selectorListener.selector(
                        store.getState(),
                        prevSelection);

                if (prevSelection !== selection) {
                    prevSelections.set(selectorListener, selection);
                    selectorListener.listener(selection, store, prevSelection);
                }
            } catch (e) {
                // Don't let one faulty listener prevent other listeners from
                // being notified about their associated changes.
                logger.error(e);
            }
        }
    }

    /**
     * Registers a specific listener to be notified when the value derived by a specific {@code selector} from a redux
     * store/state changes.
     *
     * @param {Selector} selector - The pure {@code Function} of the redux store/state (and the previous selection of
     * made by {@code selector}) which selects the value listened to by the specified {@code listener}.
     * @param {Listener} listener - The listener to register with this {@code StateListenerRegistry} so that it gets
     * invoked when the value returned by the specified {@code selector} changes.
     * @returns {void}
     */
    register(selector, listener) {
        this._selectorListeners.add({
            listener,
            selector
        });
    }

    /**
     * Subscribes to a specific redux store (so that this instance gets notified any time an action is dispatched, and
     * some part of the state (tree) of the specified redux store may potentially have changed).
     *
     * @param {Store} store - The redux store to which this {@code StateListenerRegistry} is to {@code subscribe}.
     * @returns {void}
     */
    subscribe(store) {
        // XXX If StateListenerRegistry is not utilized by the app to listen to
        // state changes, do not bother subscribing to the store at all.
        if (this._selectorListeners.size) {
            store.subscribe(
                this._listener.bind(
                    this,
                    {
                        /**
                         * The previous selections of the {@code Selector}s registered with
                         * this {@code StateListenerRegistry}.
                         *
                         * @type Map<any>
                         */
                        prevSelections: new Map(),

                        /**
                         * The redux store.
                         *
                         * @type Store
                         */
                        store
                    }));
        }
    }
}

export default new StateListenerRegistry();
