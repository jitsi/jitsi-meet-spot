/**
 * The base class for page objects from which all other page objects should
 * inherit from.
 */
class PageObject {
    /**
     * Initializes a new {@code PageObject} instance.
     *
     * @param {Object} driver - The webdriver.io browser instance which can
     * interact with Spot.
     */
    constructor(driver) {
        this.driver = driver;
    }

    /**
     * Finds HTML element.
     *
     * @param {string | Function} selector - A selector passed to the driver in order to find
     * the element.
     * @returns {Element}
     */
    select(selector) {
        return this.driver.$(selector);
    }

    /**
     * A shortcut for first selecting an {@code Element} and then calling {@code waitForDisplayed}.
     *
     * @param {string | Function} selector - A selector passed to the driver in order to find
     * the element.
     * @param {number} [waitTime] - Optional wait time given in milliseconds.
     * @returns {Element} - Returns the selected element for future use.
     */
    waitForElementDisplayed(selector, waitTime) {
        const element = this.select(selector);

        element.waitForDisplayed(waitTime);

        return element;
    }

    /**
     * Waits for this page object to be visible on the browser.
     *
     * @returns {void}
     */
    waitForVisible() {
        const rootElement = this.select(this.rootSelector);

        rootElement.waitForExist();
    }
}

module.exports = PageObject;
