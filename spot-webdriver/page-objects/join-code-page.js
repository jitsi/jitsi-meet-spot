const constants = require('../constants');
const PageObject = require('./page-object');

const JOIN_CODE_VIEW = '[data-qa-id=join-code-view]';
const JOIN_CODE_INPUT = '[data-qa-id=join-code-input]';
const SUBMIT_BUTTON = '[data-qa-id=join-code-submit]';

/**
 * A page object for interacting with the join code entry view of Spot.
 */
class JoinCodePage extends PageObject {
    /**
     * Initializes a new {@code JoinCodePage} instance.
     *
     * @inheritdoc
     */
    constructor(driver) {
        super(driver);

        this.rootSelector = JOIN_CODE_VIEW;
    }

    /**
     * Enters a join code and attempts to submit it.
     *
     * @param {string} code - The code to be entered.
     * @returns {void}
     */
    submitCode(code) {
        this.driver.waitForVisible(
            JOIN_CODE_INPUT,
            constants.VISIBILITY_WAIT
        );

        Array.prototype.forEach.call(code, (character, index) => {
            this.driver.keys(character);
        });

        this.driver.click(SUBMIT_BUTTON);
    }

    /**
     * Proceeds directly to the join code view of a remote control.
     *
     * @returns {void}
     */
    visit() {
        this.driver.url(constants.JOIN_CODE_ENTRY_URL);
        this.waitForVisible();
    }
}

module.exports = JoinCodePage;
