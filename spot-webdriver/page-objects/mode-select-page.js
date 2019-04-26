const PageObject = require('./page-object');

const MODE_SELECTION = '[data-qa-id=mode-select]';
const REMOTE_CONTROL_BUTTON = '[data-qa-id=remote-control]';

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
    constructor(driver) {
        super(driver);

        this.rootSelector = MODE_SELECTION;
    }

    /**
     * Clicks the button to transition to the full Spot-Remote interface.
     *
     * @returns {void}
     */
    selectFullRemoteControlMode() {
        const remoteControlButton = this.waitForElementDisplayed(REMOTE_CONTROL_BUTTON);

        remoteControlButton.click();
    }
}

module.exports = ModeSelectPage;
