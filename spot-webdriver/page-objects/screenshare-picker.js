const PageObject = require('./page-object');

const SCREENSHARE_PICKER = '[data-qa-id=screenshare-picker]';
const START_WIRELESS_SCREENSHARE = '[data-qa-id=start-wireless-screenshare]';
const STOP_SHARE_CONFIRM = '[data-qa-id=stop-share-button]';

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
    startWirelessScreenshare() {
        const startWirelessScreenshareButton
            = this.waitForElementDisplayed(START_WIRELESS_SCREENSHARE);

        startWirelessScreenshareButton.click();
    }

    /**
     * Clicks the button to stop any screenshare in progress.
     *
     * @returns {void}
     */
    stopScreensharing() {
        const stopShareButton
            = this.waitForElementDisplayed(STOP_SHARE_CONFIRM);

        stopShareButton.click();
    }
}

module.exports = ScreensharePicker;
