const PageObject = require('./page-object');

const SCREENSHARE_PICKER = '.screenshare-picker';
const START_WIRELESS_SCREENSHARE = '.start-wireless-screenshare';
const STOP_SHARE_CONFIRM = '.stop-share-button';

/**
 * A page object for interacting with the UI for starting wired or wireless
 * screensharing.
 */
class ScreensharePicker extends PageObject {
    /**
     * Initializes a new {@code ScreensharePicker} instance.
     *
     * @inheritdoc
     */
    constructor(driver) {
        super(driver, SCREENSHARE_PICKER);
    }

    /**
     * Clicks the button to show the desktop picker for starting a wireless
     * screenshare.
     *
     * @returns {void}
     */
    async startWirelessScreenshare() {
        const startWirelessScreenshareButton
            = await this.waitForElementDisplayed(START_WIRELESS_SCREENSHARE);

        await startWirelessScreenshareButton.click();
    }

    /**
     * Clicks the button to stop any screenshare in progress.
     *
     * @returns {void}
     */
    async stopScreensharing() {
        const stopShareButton
            = await this.waitForElementDisplayed(STOP_SHARE_CONFIRM);

        await stopShareButton.click();
    }
}

module.exports = ScreensharePicker;
