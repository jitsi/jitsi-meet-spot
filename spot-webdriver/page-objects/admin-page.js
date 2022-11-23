const PageObject = require('./page-object');

const ADMIN_VIEW = '.admin-view';
const DEVICE_SELECTION_START_BUTTON = '.device-selection-button';
const DEVICE_SELECTION_SUBMIT_BUTTON = '.device-selection-submit';
const EXIT_BUTTON = '.modal-close';
const SCREENSHARE_SELECTOR = '#screenshare';

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
        super(driver, ADMIN_VIEW);
    }

    /**
     * Uses the UI to leave the admin view, thereby avoiding a page reload.
     *
     * @returns {void}
     */
    async exit() {
        const exitButton = await this.waitForElementDisplayed(EXIT_BUTTON);

        await exitButton.click();
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
    async setScreenshareInput(deviceLabel) {
        const changeScreenshareButton
        = await this.waitForElementDisplayed(DEVICE_SELECTION_START_BUTTON);

        await changeScreenshareButton.click();

        const screenshareSelector
            = await this.waitForElementDisplayed(SCREENSHARE_SELECTOR);

        await screenshareSelector.click();

        const deviceSelection = `li*=${deviceLabel}`;
        const deviceLabelOption = await this.waitForElementDisplayed(deviceSelection);

        await deviceLabelOption.click();

        await this.waitForElementHidden(deviceSelection);

        const submitButton
            = await this.waitForElementDisplayed(DEVICE_SELECTION_SUBMIT_BUTTON);

        await submitButton.click();

        // Wait for the screenshare selector to be hidden to signal submission
        // complete.
        await this.waitForElementHidden(SCREENSHARE_SELECTOR);
    }
}

module.exports = AdminPage;
