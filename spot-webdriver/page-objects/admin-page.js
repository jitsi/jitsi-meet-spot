const constants = require('../constants');
const PageObject = require('./page-object');

const ADMIN_VIEW = '[data-qa-id=admin-view]';
const CHANGE_SCREENSHARE_BUTTON = '[data-qa-id=admin-change-screenshare]';
const EXIT_BUTTON = '[data-qa-id=admin-exit]';
const SCREENSHARE_DEVICE_LIST = '[data-qa-id=screenshare-input-devices]';
const SCREENSHARE_DEVICE_SKIP = '[data-qa-id=screenshare-input-skip]';

/**
 * A page object for interacting with the admin configuration view of a Spot-TV.
 */
class AdminPage extends PageObject {
    /**
     * Initializes a new {@code AdminPage} instance.
     *
     * @inheritdoc
     */
    constructor(driver) {
        super(driver);

        this.rootSelector = ADMIN_VIEW;
    }

    /**
     * Uses the UI to leave the admin view, thereby avoiding a page reload.
     *
     * @returns {void}
     */
    exit() {
        const exitButton = this.waitForElementDisplayed(EXIT_BUTTON);

        exitButton.click();
    }

    /**
     * Interacts with the admin view to configure Spot-TV to use a specified
     * device as a wired screensharing input.
     *
     * @param {string} deviceLabel - The name of the device. The name is matched
     * on a partial, so a partial device label may be passed. If undefined is
     * passed then any configured screensharing input will be unset.
     * @returns {void}
     */
    setScreenshareInput(deviceLabel) {
        const changeScreenshareButton
            = this.waitForElementDisplayed(CHANGE_SCREENSHARE_BUTTON);

        changeScreenshareButton.click();

        this.waitForElementDisplayed(SCREENSHARE_DEVICE_LIST);

        const screenshareInputButtonSelector = deviceLabel
            ? `button*=${deviceLabel}` : SCREENSHARE_DEVICE_SKIP;
        const button = this.driver.$(screenshareInputButtonSelector);

        button.waitForDisplayed();
        button.click();
    }

    /**
     * Proceeds directly to the admin view of a Spot-TV.
     *
     * @returns {void}
     */
    visit() {
        this.driver.url(constants.SPOT_TV_ADMIN_URL);
        this.waitForVisible();
    }
}

module.exports = AdminPage;
