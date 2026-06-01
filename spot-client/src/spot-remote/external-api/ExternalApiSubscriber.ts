import type { RootState } from 'common/app-state';
import { EVENTS } from './constants';

/**
 * A class which automatically invokes notifies when some state of interested
 * to external consumers (iframe or window openers) has been updated.
 */
export class ExternalApiSubscriber {
    private _updateCallback: (event: { type: string; details: any; }) => void;
    private _previousView: any;

    /**
     * Initializes a new {@code ExternalApiSubscriber} instance.
     *
     * @param updateCallback - The function to invoke when there is
     * a change of interest.
     */
    constructor(updateCallback: (event: { type: string; details: any; }) => void) {
        this._updateCallback = updateCallback;
        this._previousView = null;
    }

    /**
     * Compares redux store updates with cached value and emits change events.
     *
     * @param state - The redux state from which to subscribe to
     * app-state updates and notify any external listeners.
     * @returns {void}
     */
    onUpdate(state: RootState): void {
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
