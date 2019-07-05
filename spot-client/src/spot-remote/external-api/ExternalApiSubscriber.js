import { EVENTS } from './constants';

/**
 * A class which automatically invokes notifies when some state of interested
 * to external consumers (iframe or window openers) has been updated.
 */
export class ExternalApiSubscriber {
    /**
     * Initializes a new {@code ExternalApiSubscriber} instance.
     *
     * @param {Function} updateCallback - The function to invoke when there is
     * a change of interest.
     */
    constructor(updateCallback) {
        this._updateCallback = updateCallback;
        this._previousView = null;
    }

    /**
     * Compares redux store updates with cached value and emits change events.
     *
     * @param {Object} state - The redux state from which to subscribe to
     * app-state updates and notify any external listeners.
     * @returns {void}
     */
    onUpdate(state) {
        const { view } = state.spotTv;

        if (this._previousView !== view) {
            this._updateCallback({
                type: EVENTS.SPOT_TV_VIEW_CHANGED,
                details: { view }
            });

            this._previousView = view;
        }
    }
}
