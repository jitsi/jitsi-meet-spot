import type { BrowserName } from '../constants/index.js';

import PageObject from './page-object.js';

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
    constructor(driver: BrowserName) {
        super(driver, SCREENSHARE_PICKER);
    }

    /**
     * Clicks the button to show the desktop picker for starting a wireless
     * screenshare.
     *
     * @returns {void}
     */
    async startWirelessScreenshare(): Promise<void> {
        const startWirelessScreenshareButton
            = await this.waitForElementDisplayed(START_WIRELESS_SCREENSHARE);

        await startWirelessScreenshareButton.click();
    }

    /**
     * Clicks the button to stop any screenshare in progress.
     *
     * @returns {void}
     */
    async stopScreensharing(): Promise<void> {
        const stopShareButton
            = await this.waitForElementDisplayed(STOP_SHARE_CONFIRM);

        await stopShareButton.click();
    }
}

export default ScreensharePicker;
