const PageObject = require('./page-object');

const STOP_SHARE_CTA = '.stop-share';
const STOP_SHARE_BUTTON = '.stop-share-button';

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
    async stopScreensharing() {
        const stopShareButton = await this.waitForElementDisplayed(STOP_SHARE_BUTTON);

        await stopShareButton.click();
    }
}

module.exports = StopSharePage;
