const PageObject = require('./page-object');

const CONTINUE_BUTTON = '[data-qa-id=help-continue]';
const HELP_VIEW = '[data-qa-id=help-view]';

/**
 * A page object for interacting with the help view of Spot-Remote.
 */
class HelpPage extends PageObject {
    /**
     * Initializes a new {@code HelpPage} instance.
     *
     * @inheritdoc
     */
    constructor(driver) {
        super(driver);

        this.rootSelector = HELP_VIEW;
    }

    /**
     * Dismisses the help page.
     *
     * @returns {void}
     */
    exit() {
        const continueButton = this.waitForElementDisplayed(CONTINUE_BUTTON);

        continueButton.click();
    }
}

module.exports = HelpPage;
