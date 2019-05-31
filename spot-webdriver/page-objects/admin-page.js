const PageObject = require('./page-object');

const ADMIN_VIEW = '[data-qa-id=admin-view]';
const DEVICE_SELECTION_START_BUTTON = '[data-qa-id=device-selection-button]';
const DEVICE_SELECTION_SUBMIT_BUTTON = '[data-qa-id=device-selection-submit]';
const EXIT_BUTTON = '[data-qa-id=modal-close]';
const SCREENSHARE_SELECTOR = '[data-qa-id=screenshare]';

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
            = this.waitForElementDisplayed(DEVICE_SELECTION_START_BUTTON);

        changeScreenshareButton.click();

        const screenshareSelector
            = this.waitForElementDisplayed(SCREENSHARE_SELECTOR);

        screenshareSelector.click();

        const deviceSelection = `li*=${deviceLabel}`;
        const deviceLabelOption = this.waitForElementDisplayed(deviceSelection);

        deviceLabelOption.click();

        this.waitForElementHidden(deviceSelection);

        const submitButton
            = this.waitForElementDisplayed(DEVICE_SELECTION_SUBMIT_BUTTON);

        submitButton.click();
    }
}

module.exports = AdminPage;
