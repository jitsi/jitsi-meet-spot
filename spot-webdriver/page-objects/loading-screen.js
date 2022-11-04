const PageObject = require('./page-object');

const LOADING_SCREEN = '.loading';
const RECONNECT_INDICATOR = '.reconnect-indicator';

/**
 * A page object for interacting with the loading screen displayed when connecting or reconnecting.
 *
 * @extends PageObject
 */
class LoadingScreen extends PageObject {
    /**
     * Initializes a new {@code LoadingScreen} instance.
     *
     * @inheritdoc
     */
    constructor(driver) {
        super(driver, LOADING_SCREEN);
    }

    /**
     * Waits for the loading screen to appear.
     *
     * @param {number} [timeToWait] - How long to wait. Default timeout of 25 seconds - it can take
     * time for the reconnect to start.
     * @returns {void}
     */
    async waitForLoadingToAppear(timeToWait = 25 * 1000) {
        await this.waitForElementDisplayed(LOADING_SCREEN, timeToWait);
    }

    /**
     * Waits for the loading screen to disappear.
     *
     * @param {number} [timeToWait] - How long to wait.
     * @returns {void}
     */
    async waitForLoadingToDisappear(timeToWait) {
        await this.waitForHidden(timeToWait);
    }

    /**
     * Waits for the loading screen to appear.
     *
     * @param {number} [timeToWait] - How long to wait. Default timeout of 25 seconds - it can take
     * time for the reconnect to start.
     * @returns {void}
     */
    async waitForReconnectingToAppear(timeToWait = 25 * 1000) {
        await this.waitForElementDisplayed(RECONNECT_INDICATOR, timeToWait);
    }

    /**
     * Waits for the loading screen to disappear.
     *
     * @param {number} [timeToWait] - How long to wait.
     * @returns {void}
     */
    async waitForReconnectingToDisappear(timeToWait = 25 * 1000) {
        await this.waitForElementHidden(RECONNECT_INDICATOR, timeToWait);
    }
}

module.exports = LoadingScreen;
