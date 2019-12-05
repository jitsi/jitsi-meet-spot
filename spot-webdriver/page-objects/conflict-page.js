const PageObject = require('./page-object');

const CONFLICT_VIEW = '[data-qa-id=conflict-view]';

const RETRY_BUTTON = '[data-qa-id=conflict-retry';

/**
 * A page object for interacting with the conflict view of Spot-TV.
 */
class ConflictPage extends PageObject {
    /**
     * Initializes a new {@code CalendarPage} instance.
     *
     * @inheritdoc
     */
    constructor(driver) {
        super(driver, CONFLICT_VIEW);
    }

    /**
     * Clicks the retry button which makes the TV try to connect again.
     *
     * @returns {void}
     */
    clickRetry() {
        this.select(RETRY_BUTTON).click();
    }

    /**
     * Waits for this page object to be visible on the browser.
     *
     * Overrides the super method to provide default value based on the timeout defined in xmpp-connection logic for
     * conflict detection. The value there is 35 seconds, so make it almost twice as that.
     *
     * @param {number} [timeout] - An override of the number of milliseconds to
     * wait for the element to exist.
     * @returns {void}
     */
    waitForVisible(timeout = 60000) {
        super.waitForVisible(timeout);
    }
}

module.exports = ConflictPage;
