import type { BrowserName } from '../constants/index.js';

import PageObject from './page-object.js';

const MODE_SELECTION = '.mode-select';
const REMOTE_CONTROL_BUTTON = '.remote-control';

/**
 * A page object for interacting with the Share Mode view for choosing to
 * start screensharing or enter the full Spot-Remote view.
 */
class ModeSelectPage extends PageObject {
    /**
     * Initializes a new {@code ModeSelectPage} instance.
     *
     * @inheritdoc
     */
    constructor(driver: BrowserName) {
        super(driver, MODE_SELECTION);
    }

    /**
     * Clicks the button to transition to the full Spot-Remote interface.
     *
     * @returns {void}
     */
    async selectFullRemoteControlMode(): Promise<void> {
        const remoteControlButton = await this.waitForElementDisplayed(REMOTE_CONTROL_BUTTON);

        await remoteControlButton.click();
    }
}

export default ModeSelectPage;
