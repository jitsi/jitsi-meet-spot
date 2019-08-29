const constants = require('../constants');
const PageObject = require('./page-object');

const JOIN_CODE_INPUT = '[data-qa-id=join-code-input]';
const JOIN_CODE_SUBMIT_BUTTON = '[data-qa-id=join-code-submit]';
const JOIN_CODE_VIEW = '[data-qa-id=join-code-view]';

/**
 * A page object for interacting with the join code entry view of Spot-Remote.
 */
class JoinCodePage extends PageObject {
    /**
     * Initializes a new {@code JoinCodePage} instance.
     *
     * @inheritdoc
     */
    constructor(driver) {
        super(driver, JOIN_CODE_VIEW);
    }

    /**
     * Enters a join code.
     *
     * @param {string} code - The code to be entered.
     * @returns {void}
     */
    enterCode(code) {
        this.waitForElementDisplayed(JOIN_CODE_INPUT);

        Array.prototype.forEach.call(code, character => {
            this.driver.keys(character);
        });
    }

    /**
     * Manually submits any entered join code.
     *
     * @returns {void}
     */
    submitCode() {
        this.waitForElementDisplayed(JOIN_CODE_SUBMIT_BUTTON);

        this.select(JOIN_CODE_SUBMIT_BUTTON).click();
    }

    /**
     * Proceeds directly to the join code view of Spot-Remote.
     *
     * @param {Map} [queryParams] - Additional parameters to append to the join
     * code url.
     * @param {number} [visibilityWait] - Override for how long page load should wait for before reporting the page as
     * having failed to load. Pass '-1' to skip the waiting.
     * @returns {void}
     */
    visit(queryParams, visibilityWait) {
        this.driver.url(this._getJoinCodePageUrl(queryParams));
        visibilityWait === -1 || this.waitForVisible(visibilityWait);
    }

    /**
     * Generates the URL to visit the join code page.
     *
     * @param {Map} [queryParams] - Additional parameters to append to the join
     * code url.
     * @private
     * @returns {string}
     */
    _getJoinCodePageUrl(queryParams) {
        let joinCodePageUrl = constants.JOIN_CODE_ENTRY_URL;

        if (queryParams) {
            joinCodePageUrl += '?';

            for (const [ key, value ] of queryParams) {
                joinCodePageUrl += `${key}=${value}&`;
            }
        }

        return joinCodePageUrl;
    }
}

module.exports = JoinCodePage;
