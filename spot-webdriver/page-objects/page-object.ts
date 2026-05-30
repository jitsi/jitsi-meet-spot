import type { BrowserName } from '../constants/index.js';
import { driverFor } from '../helpers/driver.js';

/** Options for {@link PageObject.waitForBooleanState}. */
interface BooleanStateOptions {
    offStateSelector: string;
    onStateSelector: string;
    waitTime: number;
}

/**
 * The base class for page objects from which all other page objects should inherit.
 */
class PageObject {
    driver: BrowserName;
    rootSelector: string;

    /**
     * Initializes a new {@code PageObject} instance.
     *
     * @param driver - The capability name of the browser which can interact with Spot.
     * @param rootSelector - The selector to locate the root element of the new page object.
     */
    constructor(driver: BrowserName, rootSelector: string) {
        this.driver = driver;
        this.rootSelector = rootSelector;
    }

    /**
     * The WebdriverIO browser instance for this page object's capability.
     *
     * @returns {WebdriverIO.Browser}
     */
    protected get _browser(): WebdriverIO.Browser {
        return driverFor(this.driver);
    }

    /**
     * Finds an HTML element.
     *
     * @param selector - A selector passed to the driver in order to find the element.
     * @returns {Promise<WebdriverIO.Element>}
     */
    async select(selector: string) {
        return await this._browser.$(selector);
    }

    /**
     * A shortcut for first selecting an element and then calling {@code waitForDisplayed}.
     *
     * @param selector - A selector passed to the driver in order to find the element.
     * @param waitTime - Optional wait time given in milliseconds.
     * @returns {Promise<WebdriverIO.Element>} - Returns the selected element for future use.
     */
    async waitForElementDisplayed(selector: string, waitTime?: number) {
        const element = await this.select(selector);

        await element.waitForDisplayed({ timeout: waitTime });

        return element;
    }

    /**
     * Waits for an element to no longer be visible.
     *
     * @param selector - A selector passed to the driver in order to find the element.
     * @param waitTime - Optional wait time given in milliseconds.
     * @returns {Promise<WebdriverIO.Element>} - Returns the selected element for future use.
     */
    async waitForElementHidden(selector: string, waitTime?: number) {
        const element = await this.select(selector);

        await element.waitForDisplayed({ timeout: waitTime,
            reverse: true });

        return element;
    }

    /**
     * Waits for the element to be in the given state.
     *
     * @param state - The state to wait for.
     * @param options - See each option for details.
     * @returns {Promise<void>}
     */
    async waitForBooleanState(state: boolean, options: BooleanStateOptions): Promise<void> {
        const {
            onStateSelector,
            offStateSelector,
            waitTime
        } = options;
        const selector = state ? onStateSelector : offStateSelector;

        await this.waitForElementDisplayed(selector, waitTime);
    }

    /**
     * Wait for this page object to be hidden.
     *
     * @param timeToWait - How many milliseconds to wait before failing the test.
     * @returns {Promise<this>} - Returns this instance for call chaining.
     */
    async waitForHidden(timeToWait?: number): Promise<this> {
        await this.waitForElementHidden(this.rootSelector, timeToWait);

        return this;
    }

    /**
     * Waits for this page object to be visible on the browser.
     *
     * @param timeout - An override of the number of milliseconds to wait for the element to exist.
     * @returns {Promise<void>}
     */
    async waitForVisible(timeout?: number): Promise<void> {
        const rootElement = await this.select(this.rootSelector);

        await rootElement.waitForExist({ timeout });
    }
}

export default PageObject;
