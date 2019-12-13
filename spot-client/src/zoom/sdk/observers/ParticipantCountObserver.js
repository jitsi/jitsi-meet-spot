const PARTICIPANT_COUNT_LABEL = '.footer-button__number-counter span';

/**
 * Tracks the number of participants in a Zoom meeting through DOM MutationObserver.
 */
export default class ParticipantCountObserver {
    /**
     * Initializes a new instance.
     *
     * @param {Function} stateChangeCallback - Callback to invoke when the participants count changes.
     */
    constructor(stateChangeCallback) {
        this._stateChangeCallback = stateChangeCallback;

        this._participantsLabelObserver = new MutationObserver(this._onParticipantCountChange.bind(this));
    }

    /**
     * Begins observing the participants count.
     *
     * @returns {void}
     */
    start() {
        this._participantsLabelObserver.observe(
            document.querySelector(PARTICIPANT_COUNT_LABEL), {
                characterData: true,
                subtree: true
            });
        this._stateChangeCallback(this.getCurrentValue());
    }

    /**
     * Gets the current participants count.
     *
     * @returns {number|undefined}
     */
    getCurrentValue() {
        const text = document.querySelector(PARTICIPANT_COUNT_LABEL)?.textContent;

        return text ? Number(text) : undefined;
    }

    /**
     * Stops observing the participants count for changes.
     *
     * @returns {void}
     */
    stop() {
        this._participantsLabelObserver.disconnect();
    }

    /**
     * Callback invoked to notify the listener of the current participants count.
     *
     * @private
     * @returns {void}
     */
    _onParticipantCountChange() {
        this._stateChangeCallback(this.getCurrentValue());
    }
}
