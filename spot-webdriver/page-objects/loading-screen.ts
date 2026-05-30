import type { BrowserName } from '../constants/index.js';

import PageObject from './page-object.js';

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
    constructor(driver: BrowserName) {
        super(driver, LOADING_SCREEN);
    }

    /**
     * Waits for the loading screen to appear.
     *
     * @param timeToWait - How long to wait. Default timeout of 25 seconds - it can take
     * time for the reconnect to start.
     * @returns {void}
     */
    async waitForLoadingToAppear(timeToWait = 25 * 1000): Promise<void> {
        await this.waitForElementDisplayed(LOADING_SCREEN, timeToWait);
    }

    /**
     * Waits for the loading screen to disappear.
     *
     * @param timeToWait - How long to wait.
     * @returns {void}
     */
    async waitForLoadingToDisappear(timeToWait?: number): Promise<void> {
        await this.waitForHidden(timeToWait);
    }

    /**
     * Waits for the loading screen to appear.
     *
     * @param timeToWait - How long to wait. Default timeout of 25 seconds - it can take
     * time for the reconnect to start.
     * @returns {void}
     */
    async waitForReconnectingToAppear(timeToWait = 25 * 1000): Promise<void> {
        await this.waitForElementDisplayed(RECONNECT_INDICATOR, timeToWait);
    }

    /**
     * Waits for the loading screen to disappear.
     *
     * @param timeToWait - How long to wait.
     * @returns {void}
     */
    async waitForReconnectingToDisappear(timeToWait = 25 * 1000): Promise<void> {
        await this.waitForElementHidden(RECONNECT_INDICATOR, timeToWait);
    }
}

export default LoadingScreen;
