import { clickIfExists } from './uiUtils';

/**
 * Encapsulates mute interactions with the Zoom UI.
 */
export default class AbstractMuteController {
    /**
     * Initializes a new instance.
     *
     * @param {Function} stateChangeCallback - Callback to invoke when the mute
     * state changes.
     */
    constructor(stateChangeCallback) {
        this._stateChangeCallback = stateChangeCallback;

        this._muteButtonObserver = new MutationObserver(this._onMuteStateChange.bind(this));
    }

    /**
     * Sets mute to the desired state.
     *
     * @abstract
     * @param {boolean} mute - Whether to be muted or unmuted.
     * @returns {void}
     */
    setMute() {
        throw new Error('setMute not implemented');
    }

    /**
     * Begins observing the mute button for changes.
     *
     * @returns {void}
     */
    start() {
        this._onMuteStateChange();

        this._muteButtonObserver.observe(
            this._getElementToObserve(),
            { attributes: true }
        );
    }

    /**
     * Stops observing the mute button for changes.
     *
     * @returns {void}
     */
    stop() {
        this._muteButtonObserver.disconnect();
    }

    /**
     * Interacts with the DOM to click the element which matches the provided
     * selector.
     *
     * @param {string} selector - The css query selector to use to find the
     * element.
     * @private
     * @returns {void}
     */
    _clickIfExists(selector) {
        return clickIfExists(selector);
    }

    /**
     * Returns whether or not the UI is displaying muted or unmuted.
     *
     * @abstract
     * @private
     * @returns {boolean}
     */
    _getCurrentMuteState() {
        throw new Error('_getCurrentMuteState not implemented');
    }

    /**
     * Returns the HTMLElement which updates known mute state.
     *
     * @abstract
     * @private
     * @returns {HTMLElement}
     */
    _getElementToObserve() {
        throw new Error('_getElementToObserve not implemented');
    }

    /**
     * Callback invoked to notify the listener of the current mute state.
     *
     * @private
     * @returns {void}
     */
    _onMuteStateChange() {
        this._stateChangeCallback(this._getCurrentMuteState());
    }
}
