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
        const joinCodeInput = this.driver.$(JOIN_CODE_INPUT);

        joinCodeInput.waitForDisplayed();

        Array.prototype.forEach.call(code, character => {
            this.driver.keys(character);
        });

        const submitButton = this.driver.$(SUBMIT_BUTTON);

        submitButton.waitForDisplayed();

        submitButton.click();
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
