/**
 * The base class for page objects from which all other page objects should
 * inherit from.
 */
class PageObject {
    /**
     * Initializes a new {@code PageObject} instance.
     *
     * @param {Object} driver - The webdriver.io browser name instance defined in configuration which can
     * interact with Spot.
     * @param {string} rootSelector - The selector to locate the root element of the new page
     * object.
     */
    constructor(driver, rootSelector) {
        this.driver = driver;
        this.rootSelector = rootSelector;
    }

    /**
     * Finds HTML element.
     *
     * @param {string | Function} selector - A selector passed to the driver in order to find
     * the element.
     * @returns {Element}
     */
    async select(selector) {
        return await browser[this.driver].$(selector);
    }

    /**
     * A shortcut for first selecting an {@code Element} and then calling {@code waitForDisplayed}.
     *
     * @param {string | Function} selector - A selector passed to the driver in order to find
     * the element.
     * @param {number} [waitTime] - Optional wait time given in milliseconds.
     * @returns {Element} - Returns the selected element for future use.
     */
    async waitForElementDisplayed(selector, waitTime) {
        const element = await this.select(selector);

        await element.waitForDisplayed({ timeout: waitTime });

        return element;
    }

    /**
     * Waits for an element to no longer be visible.
     *
     * @param {string | Function} selector - A selector passed to the driver in order to find
     * the element.
     * @param {number} [waitTime] - Optional wait time given in milliseconds.
     * @returns {Element} - Returns the selected element for future use.
     */
    async waitForElementHidden(selector, waitTime) {
        const element = await this.select(selector);

        await element.waitForDisplayed(waitTime, true);

        return element;
    }

    /**
     * Waits for the element to be in the given state.
     *
     * @param {boolean} state - The state to wait for.
     * @param {Object} options - See each option for details.
     * @param {string} options.onStateSelector - The element selector used for the truthy state.
     * @param {string} options.offStateSelector - The element's selector used for the not truthy
     * state.
     * @param {number} options.waitTime - How long will the method wait for the state to change (in
     * milliseconds).
     * @returns {void}
     */
    async waitForBooleanState(state, options) {
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
     * @param {number} [timeToWait] - How many seconds to wait before failing the test.
     * @returns {PageObject} - Returns this instance for calls chaining.
     */
    async waitForHidden(timeToWait) {
        await this.waitForElementHidden(this.rootSelector, timeToWait);

        return this;
    }

    /**
     * Waits for this page object to be visible on the browser.
     *
     * @param {number} [timeout] - An override of the number of milliseconds to
     * wait for the element to exist.
     * @returns {void}
     */
    async waitForVisible(timeout) {
        const rootElement = await this.select(this.rootSelector);

        await rootElement.waitForExist(timeout);
    }
}

module.exports = PageObject;
