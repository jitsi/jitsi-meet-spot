const PageObject = require('./page-object');

const RECONNECT_OVERLAY = '[data-qa-id=reconnect-overlay]';

/**
 * A page object for interacting with the reconnect overlay displayed when reconnecting.
 *
 * @extends PageObject
 */
class ReconnectOverlay extends PageObject {
    /**
     * Initializes a new {@code ReconnectOverlay} instance.
     *
     * @inheritdoc
     */
    constructor(driver) {
        super(driver);

        this.rootSelector = RECONNECT_OVERLAY;
    }

    /**
     * Waits for the overlay to appear.
     *
     * @param {number} [timeToWait] - How long to wait. Default timeout of 25 seconds - it can take
     * time for the reconnect to start.
     * @returns {void}
     */
    waitForOverlayToAppear(timeToWait = 25 * 1000) {
        this.waitForElementDisplayed(RECONNECT_OVERLAY, timeToWait);
    }

    /**
     * Waits for the overlay to disappear.
     *
     * @param {number} [timeToWait] - How long to wait.
     * @returns {void}
     */
    waitForOverlayToDisappear(timeToWait) {
        this.waitForElementHidden(RECONNECT_OVERLAY, timeToWait);
    }
}

module.exports = ReconnectOverlay;
