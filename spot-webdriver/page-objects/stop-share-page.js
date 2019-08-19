const PageObject = require('./page-object');

const STOP_SHARE_CTA = '[data-qa-id=stop-share]';
const STOP_SHARE_BUTTON = '[data-qa-id=stop-share-button]';

/**
 * A page object for interacting with the Share Mode view of Spot-Remote for
 * stopping any local wireless screenshare in progress.
 */
class StopSharePage extends PageObject {
    /**
     * Initializes a new {@code StopSharePage} instance.
     *
     * @inheritdoc
     */
    constructor(driver) {
        super(driver, STOP_SHARE_CTA);
    }

    /**
     * Clicks the button to stop a screenshare in progress.
     *
     * @returns {void}
     */
    stopScreensharing() {
        const stopShareButton = this.waitForElementDisplayed(STOP_SHARE_BUTTON);

        stopShareButton.click();
    }
}

module.exports = StopSharePage;
