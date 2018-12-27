const constants = require('../constants');

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
     * Waits for this page object to be visible on the browser. Will error if
     * it is not visible within {@code VISIBILITY_WAIT}.
     *
     * @returns {void}
     */
    waitForVisible() {
        this.driver.waitForVisible(
            this.rootSelector,
            constants.VISIBILITY_WAIT
        );
    }
}

module.exports = PageObject;
